import { Icon } from '@iconify/react';


export function Gallery() {
  return (
    <div className="w-full flex flex-col">
        <div className="inline-flex items-center align-self-start gap-1 text-sm font-medium text-gray-900 mb-2"
        onClick={()=>{console.log('scroll down till full view of gallery')}}>
            See more
            <Icon icon="mdi:arrow-down" height="16" width="16" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 w-full">
        <div className="grid gap-4">
            <div>
            <img
                className="h-auto max-w-full rounded-lg object-cover object-center"
                src="https://i.pinimg.com/736x/8b/06/5f/8b065f9464c2d7a9862fbc85d7acebf2.jpg"
                alt="gallery-photo"
                />
            </div>
            <div>
            <img
                className="h-auto max-w-full rounded-lg object-cover object-center "
                src="https://i.pinimg.com/736x/23/95/f8/2395f8b496f09ee5e8e8bbc38c732892.jpg"
                alt="gallery-photo"
                />
            </div>
            <div>
            <img
                className="h-auto max-w-full rounded-lg object-cover object-center"
                src="https://i.pinimg.com/1200x/d1/1b/a8/d11ba82a91a97f12939e93c00fd82271.jpg"
                alt="gallery-photo"
            />
            </div>
        </div>
        <div className="grid gap-4">
            <div>
            <img
                className="h-auto max-w-full rounded-lg object-cover object-center"
                src="https://i.pinimg.com/736x/95/07/cb/9507cb4c18e58253809616f0daa8ec7a.jpg"
                alt="gallery-photo"
                />
            </div>
            <div>
            <img
                className="h-auto max-w-full rounded-lg object-cover object-center"
                src="https://i.pinimg.com/1200x/3e/71/91/3e7191b9f6f76d0950b0b5791ccad77e.jpg"
                alt="gallery-photo"
                />
            </div>
            
        </div>
        </div>
    </div>
  );
}