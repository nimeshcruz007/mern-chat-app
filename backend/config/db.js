const mongoose = require('mongoose');

async function connectDB(){
    try {
        const db = await mongoose.connect('mongodb+srv://nimeshnair1999:KlVn3peuNWViPbHN@cluster0.r3f7nge.mongodb.net/?retryWrites=true&w=majority');
        console.log('connected to mongoDB');
    } catch (error) {
        console.log("Error",error.message)
    }
}


module.exports = connectDB