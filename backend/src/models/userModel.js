const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true
    },
    password: {
        type: String
    },
    studentRollNumber: {
        type: String,
        trim: true
    },
    parentsEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    parentsPhone: {
        type: String,
        trim: true
    },
    fatherName: {
        type: String,
        trim: true
    },
    face: {
        type: String
    },
    department: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'student'],
        required: true,
        default: 'student'
    }
}, { timestamps: true });

userSchema.pre('save', async function () {

    if (this.role === 'admin') {
        if (!this.name || !this.email || !this.password) {
            throw new Error('Admin must have name, email, and password');
        }

        this.studentRollNumber = undefined;
        this.parentsEmail = undefined;
        this.parentsPhone = undefined;
        this.fatherName = undefined;
        this.face = undefined;
        this.department = undefined;
    }

    if (this.role === 'student') {
        if (
            !this.name ||
            !this.email ||
            !this.studentRollNumber ||
            !this.parentsEmail ||
            !this.parentsPhone ||
            !this.fatherName ||
            !this.face ||
            !this.department
        ) {
            throw new Error('Student must have all required fields');
        }

        this.password = undefined;
    }
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;