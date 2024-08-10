
// const express = require('express');
// const bodyParser = require('body-parser');
// const fs = require('fs');
// const path = require('path');
// const app = express();

// app.use(bodyParser.json());
// app.use(express.static('public')); // Serve static files from the 'public' directory

// // Ensure directories exist
// const ensureDirExists = dir => {
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//     }
// };

// ensureDirExists('./data');
// ensureDirExists('./attendance');

// // Save employee descriptors
// app.post('/save-employee', (req, res) => {
//     try {
//         const { employeeId, descriptors } = req.body;
//         if (!employeeId || !descriptors) {
//             return res.status(400).send('Invalid request data');
//         }
//         fs.writeFileSync(`./data/${employeeId}.json`, JSON.stringify(descriptors));
//         res.sendStatus(200);
//     } catch (error) {
//         console.error('Error saving employee:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// // Mark attendance
// app.post('/mark-attendance', (req, res) => {
//     try {
//         const { employeeId } = req.body;
//         if (!employeeId) {
//             return res.status(400).send('Invalid request data');
//         }
//         const date = new Date().toISOString().split('T')[0];
//         fs.appendFileSync(`./attendance/${date}.txt`, `${employeeId}\n`);
//         res.sendStatus(200);
//     } catch (error) {
//         console.error('Error marking attendance:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// // Get employee descriptors
// app.get('/get-employee-descriptors', (req, res) => {
//     try {
//         const descriptors = [];
//         const employeeFiles = fs.readdirSync('./data');
//         employeeFiles.forEach(file => {
//             const data = JSON.parse(fs.readFileSync(`./data/${file}`));
//             descriptors.push({
//                 label: path.basename(file, '.json'),
//                 descriptors: data
//             });
//         });
//         res.json(descriptors);
//     } catch (error) {
//         console.error('Error getting employee descriptors:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// // Start the server
// app.listen(3000, () => {
//     console.log('Server running on port 3000');
// });




//////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Canvas, Image, ImageData } = require('canvas');
const faceapi = require('face-api.js');

// Initialize face-api.js with the canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load face-api.js models
const MODEL_URL = path.join(__dirname, '/models'); // Update with your model directory
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL)
]).then(() => {
    console.log('Face-api models loaded');
});

const upload = multer(); // For parsing multipart/form-data
const app = express();

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// Ensure directories exist
const ensureDirExists = dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

ensureDirExists('./data');
ensureDirExists('./attendance');

app.post('/helloworld', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).send('Name is required');
    }
    res.send(`Hello, ${name}!`);
});

// Enroll a new user with an image file and a unique username
app.post('/enrollnew', upload.single('image'), async (req, res) => {
    try {
        const { username } = req.body;
        if (!username || !req.file) {
            return res.status(400).send('Username and image file are required');
        }

        const imageBuffer = req.file.buffer;
        const image = await faceapi.bufferToImage(imageBuffer);
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

        if (detections.length === 0) {
            return res.status(400).send('No face detected in the image');
        }

        const descriptors = detections.map(d => d.descriptor);
        fs.writeFileSync(`./data/${username}.json`, JSON.stringify(descriptors));
        res.sendStatus(200);
    } catch (error) {
        console.error('Error enrolling new user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Verify a user using an image file
app.post('/verify', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Image file is required');
        }

        const imageBuffer = req.file.buffer;
        const image = await faceapi.bufferToImage(imageBuffer);
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

        if (detections.length === 0) {
            return res.status(400).send('No face detected in the image');
        }

        const descriptor = detections[0].descriptor;
        const employeeFiles = fs.readdirSync('./data');
        const labeledFaceDescriptors = employeeFiles.map(file => {
            const data = JSON.parse(fs.readFileSync(`./data/${file}`));
            return new faceapi.LabeledFaceDescriptors(path.basename(file, '.json'), data.map(d => new Float32Array(d)));
        });

        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
        const result = faceMatcher.findBestMatch(descriptor);

        if (result.label === 'unknown') {
            return res.status(404).send('No matching user found');
        } else {
            res.json({ username: result.label });
        }
    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Save employee descriptors
app.post('/save-employee', (req, res) => {
    try {
        const { employeeId, descriptors } = req.body;
        if (!employeeId || !descriptors) {
            return res.status(400).send('Invalid request data');
        }
        fs.writeFileSync(`./data/${employeeId}.json`, JSON.stringify(descriptors));
        res.sendStatus(200);
    } catch (error) {
        console.error('Error saving employee:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Mark attendance
app.post('/mark-attendance', (req, res) => {
    try {
        const { employeeId } = req.body;
        if (!employeeId) {
            return res.status(400).send('Invalid request data');
        }
        const date = new Date().toISOString().split('T')[0];
        fs.appendFileSync(`./attendance/${date}.txt`, `${employeeId}\n`);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get employee descriptors
app.get('/get-employee-descriptors', (req, res) => {
    try {
        const descriptors = [];
        const employeeFiles = fs.readdirSync('./data');
        employeeFiles.forEach(file => {
            const data = JSON.parse(fs.readFileSync(`./data/${file}`));
            descriptors.push({
                label: path.basename(file, '.json'),
                descriptors: data
            });
        });
        res.json(descriptors);
    } catch (error) {
        console.error('Error getting employee descriptors:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
