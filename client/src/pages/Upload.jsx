import { useNavigate } from 'react-router-dom';
import UploadComponent from '../components/UploadComponent';

const Upload = () => {
    const navigate = useNavigate();

    const handleUploadComplete = (data) => {
        console.log('Upload complete:', data);
        // Optionally navigate to the video or show notification
        setTimeout(() => {
            navigate(`/video/${data.videoId}`);
        }, 2000);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Upload Video</h1>
                <p className="text-gray-400 mt-2">
                    Upload your video and it will be automatically processed for sensitivity analysis.
                </p>
            </div>

            <UploadComponent onUploadComplete={handleUploadComplete} />

            {/* Upload guidelines */}
            <div className="mt-8 card">
                <h3 className="font-semibold mb-4">Upload Guidelines</h3>
                <ul className="space-y-2 text-gray-400">
                    <li className="flex items-start space-x-2">
                        <span className="text-indigo-400">•</span>
                        <span>Maximum file size: 500MB</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span className="text-indigo-400">•</span>
                        <span>Supported formats: MP4, WebM, OGG, MOV</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span className="text-indigo-400">•</span>
                        <span>Videos will be automatically processed for content analysis</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span className="text-indigo-400">•</span>
                        <span>Processing typically takes 10-15 seconds</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span className="text-indigo-400">•</span>
                        <span>Videos marked as "flagged" may require admin review</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Upload;
