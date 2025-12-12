import axios from 'axios';
import './App.css'
import PostLayout from './components/PostLayout'
import { LoadingProvider } from './Context'
import { imageDataset } from './data';

function App() {

  const bulkUploadAndIndex = async () => {
      try {

          imageDataset.forEach((image, index) => {
              uploadImage(`image_${index}`, image);
          })
      } catch (err) {
          console.error('Bulk upload error:', err);
  }
  };
  
  const uploadImage = async (imageName: string, imageUrl: string) => {
    try {
        console.log('Uploading and indexing image into Pinecone...');
        const result = await axios.post(
            "https://shotwise-upload-post-demo.onrender.com/image/upload-and-index",{
            imageName,
            imageUrl
        });
        // console.log('✅ Upload complete:', result.data);
        // console.log('Public URL:', result.data.publicUrl);

        return result.data;

    } catch (err) {
        console.error("❌ Upload error:", err);
    }
  };
  
  return (
    <div className="phone-wrapper relative w-[375px] min-h-[95vh] h-[95vh] mx-auto overflow-y-auto scrollbar-hide rounded-[20px]">
      <div className="absolute inset-0 bg-white -z-5 w-100 h-[100vh] " />
        <LoadingProvider>
          <PostLayout />
        </LoadingProvider>

        {/* For dev mode purposes. unhide button to bulk import imageDataset into Pinecone */}
        <button
        className="hidden bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        
        onClick={()=>{
            bulkUploadAndIndex();
        }}
        >bulk upload</button>
  </div>
  )
}

export default App
