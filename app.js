require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 2000;

// Middleware to serve static files and parse form data
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route to render index.ejs when accessing the root route
app.get('/', (req, res) => {
    res.render('index');
});

// POST route to handle form submission and send email
app.post('/send-email', (req, res) => {
    console.log('Request body:', req.body); // Log the request body for debugging

    const { name, email, message } = req.body;

    // Validate the form fields
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL, // Your Gmail email
            pass: process.env.PASSWORD // Your Gmail password or App-specific password
        }
    });

    // Mail options
    const mailOptions = {
        from: email, // The sender's email address
        to: process.env.EMAIL, // Your email where feedback will be sent
        subject: `New Contact Request from ${name}`, // Email subject
        text: `You have a new message from ${name} (${email}):\n\n${message}`, // Email content
        replyTo: email // Reply to the sender's email
    };

    // Send email using the transporter
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Something went wrong. Please try again.' });
        } else {
            console.log('Email sent:', info.response);
            console.log('Mail Options:', mailOptions); // Log mail options to verify
            return res.status(200).json({ message: 'Your message has been sent successfully!' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
