
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

