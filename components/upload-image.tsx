'use client'
import { useEffect, useRef, useState } from "react";
import Image from 'next/image'
import { load as cocoModalLoad } from '@tensorflow-models/coco-ssd';
import { browser } from '@tensorflow/tfjs'

export default function UploadImage() {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const imageEl = useRef<HTMLImageElement>(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [objectDetector, setObjectDetectors] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detectedObjects, setDetectedObjects] = useState([]);

  const loadOCRModel = async () => {
    const model: any = await cocoModalLoad();
    setObjectDetectors(model);
    setIsLoading(false);
  };

  const setImage = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const image = event.target.files[0];
      if (canvasEl.current && canvasEl.current.getContext('2d')) {
        const canvas = canvasEl.current.getContext('2d');
        canvas && canvas.reset();
      }
      setUploadedImage((window as any).URL.createObjectURL(image));
    }
  };

  const startDetecting = async () => {
    if (imageEl.current && objectDetector) {
      const image = browser.fromPixels(imageEl.current);
      const predictions = await objectDetector?.detect(image);
      console.log({ predictions })
      setDetectedObjects(predictions);
      if (predictions && canvasEl.current) {
        draw(canvasEl.current.getContext('2d'), predictions);
      }
    }
  };
  const draw = (ctx: any, objects: any) => {
    if (canvasEl && canvasEl.current && imageEl && imageEl.current) {
      canvasEl.current.width = imageEl.current.width;
      canvasEl.current.height = imageEl.current.height;
      // Clear part of the canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, imageEl.current.width, imageEl.current.height);

      ctx.drawImage(
        imageEl.current,
        0,
        0,
        imageEl.current.width,
        imageEl.current.height
      );
      for (let i = 0; i < objects.length; i += 1) {
        // Draw the background rectangle for text
        ctx.fillStyle = 'rgba(0, 128, 0, 0.5)';
        ctx.strokeStyle = 'white';
        ctx.fillRect(
          objects[i].bbox[0],
          objects[i].bbox[1],
          objects[i].bbox[2],
          20
        );
        // Write image class on top left of rect
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(
          objects[i].class,
          objects[i].bbox[0] + 4,
          objects[i].bbox[1] + 16
        );

        // draw rectangle using data from prediction result
        ctx.beginPath();
        ctx.rect(
          objects[i].bbox[0],
          objects[i].bbox[1],
          objects[i].bbox[2],
          objects[i].bbox[3]
        );
        ctx.strokeStyle = 'green';
        ctx.stroke();
        ctx.closePath();
      }
    }
  };

  useEffect(() => {
    loadOCRModel();
  }, []);

  return (
    <div>
      <div>
        <div>
          {uploadedImage && (
            <>
              <img
                ref={imageEl}
                src={uploadedImage}
                alt='sample image'
                style={{ objectFit: 'fill' }}
              />
              <canvas
                ref={canvasEl}
              />
            </>
          )}
        </div>
        <div>
          <label htmlFor='fileSelect'>
            <span>
              <i className='bi bi-upload'></i>
            </span>
            Upload an image
          </label>
          <input
            id='fileSelect'
            type='file'
            onChange={setImage}
            hidden
          />
        </div>
        {uploadedImage && (
          <button
            onClick={startDetecting}>
            Start detection
          </button>
        )}
      </div>
    </div>
  );
}
