const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Video = require('../models/Video');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Video.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create users
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin'
            },
            {
                name: 'Editor User',
                email: 'editor@example.com',
                password: 'editor123',
                role: 'editor'
            },
            {
                name: 'Viewer User',
                email: 'viewer@example.com',
                password: 'viewer123',
                role: 'viewer'
            }
        ]);

        console.log('👥 Users created:');
        users.forEach(user => {
            console.log(`   - ${user.email} (${user.role})`);
        });

        // Create sample videos with external URLs for demo streaming
        // These are public sample videos that can be streamed
        const videos = await Video.create([
            {
                title: 'Big Buck Bunny - Open Source Animation',
                description: 'Big Buck Bunny is a short computer animated film by the Blender Institute. This open-source project showcases the power of Blender 3D software.',
                filename: 'big-buck-bunny.mp4',
                filepath: '/uploads/big-buck-bunny.mp4',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                mimetype: 'video/mp4',
                size: 158008374, // ~150MB
                duration: 596, // ~10 minutes
                thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg',
                status: 'safe',
                uploadedBy: users[1]._id, // Editor
                metadata: { codec: 'H.264', resolution: '1920x1080', fps: 24 }
            },
            {
                title: 'Sintel - Fantasy Animation',
                description: 'Sintel is a short computer-animated fantasy film. It was made by the Blender Institute as a showcase for the open-source 3D application Blender.',
                filename: 'sintel.mp4',
                filepath: '/uploads/sintel.mp4',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
                mimetype: 'video/mp4',
                size: 190612452, // ~180MB
                duration: 888, // ~15 minutes
                thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Sintel_poster.jpg/800px-Sintel_poster.jpg',
                status: 'safe',
                uploadedBy: users[1]._id,
                metadata: { codec: 'H.264', resolution: '1920x1080', fps: 24 }
            },
            {
                title: 'Tears of Steel - Sci-Fi Short Film',
                description: 'Tears of Steel is a short science fiction film made by the Blender Institute. It features live action combined with CG effects.',
                filename: 'tears-of-steel.mp4',
                filepath: '/uploads/tears-of-steel.mp4',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                mimetype: 'video/mp4',
                size: 185267200, // ~175MB
                duration: 734, // ~12 minutes
                thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Tears_of_Steel_Title_Card.jpg/800px-Tears_of_Steel_Title_Card.jpg',
                status: 'flagged',
                uploadedBy: users[0]._id, // Admin
                metadata: { codec: 'H.264', resolution: '1920x1080', fps: 24 }
            },
            {
                title: 'Elephant Dream - Experimental Animation',
                description: 'Elephants Dream is a computer-animated short film produced almost completely using the free software 3D suite Blender.',
                filename: 'elephants-dream.mp4',
                filepath: '/uploads/elephants-dream.mp4',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                mimetype: 'video/mp4',
                size: 115343360, // ~110MB
                duration: 653, // ~11 minutes
                thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_cover.jpg/800px-Elephants_Dream_cover.jpg',
                status: 'safe',
                uploadedBy: users[1]._id,
                metadata: { codec: 'H.264', resolution: '1920x1080', fps: 24 }
            }
        ]);

        console.log('🎬 Videos created:');
        videos.forEach(video => {
            console.log(`   - ${video.title} (${video.status})`);
        });

        console.log('\n✅ Seed completed successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin:  admin@example.com  / admin123');
        console.log('   Editor: editor@example.com / editor123');
        console.log('   Viewer: viewer@example.com / viewer123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed Error:', error);
        process.exit(1);
    }
};

seedData();
