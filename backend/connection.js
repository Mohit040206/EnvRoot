require('dotenv').config();

const mongoose=require("mongoose")

async function connectingdb(){
    try{
        await mongoose.connect(process.env.DATABASE_URL)
        console.log("db connected")
    }catch(err){
        console.log("failed to connect")
        process.exit(1)
    }
}

module.exports={
    connectingdb
}