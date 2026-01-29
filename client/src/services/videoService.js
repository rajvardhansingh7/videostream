import api from './api';

/**
 * Video API Service
 */

export const videoService = {
    // Get all videos with optional filters
    getVideos: async (params = {}) => {
        const response = await api.get('/videos', { params });
        return response.data;
    },

    // Get single video
    getVideo: async (id) => {
        const response = await api.get(`/videos/${id}`);
        return response.data;
    },

    // Get my videos (for editors/admins)
    getMyVideos: async () => {
        const response = await api.get('/videos/my');
        return response.data;
    },

    // Upload video
    uploadVideo: async (formData, onProgress) => {
        const response = await api.post('/videos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            }
        });
        return response.data;
    },

    // Update video
    updateVideo: async (id, data) => {
        const response = await api.put(`/videos/${id}`, data);
        return response.data;
    },

    // Delete video
    deleteVideo: async (id) => {
        const response = await api.delete(`/videos/${id}`);
        return response.data;
    },

    // Get stream URL
    getStreamUrl: (id) => {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
        return `${baseUrl}/videos/stream/${id}?token=${token}`;
    },

    // Reprocess video (admin only)
    reprocessVideo: async (id) => {
        const response = await api.post(`/videos/${id}/reprocess`);
        return response.data;
    }
};

export default videoService;
