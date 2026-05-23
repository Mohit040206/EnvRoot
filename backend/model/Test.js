const mongoose=require("mongoose")

const testSchema=new mongoose.Schema({
    category: {
    type: String,
    enum: ["CODING", "APTITUDE", "LOGICAL", "VERBAL"],
    required: true
    },
    title:{
        type:String,
        require:true,
        trim:true,
    },
    description:{
        type:String,
    },
    duration:{
        type:Number,
        required:true
    },
    questionIds:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Questions",
            required:true
        }
    ],
    rules:{
          randomizeQuestions:{
    type:Boolean,
    default:true
  },
        minQuestionToAttempt:{
            type:Number,
            default:0
        },
        fullscreenRequired:{
            type:Boolean,
            default:false
        },
        maxTabSwitch:{
            type:Number,
            default:2
        }
    },
    isActive:{
        type:Boolean,
        default:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }

},{timestamps:true})

module.exports=mongoose.model("Test",testSchema)
