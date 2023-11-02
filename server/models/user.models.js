const { Schema,model } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const userSchema = new Schema({
    fullName:{
        type:String,
        required:[true,"Full name is required"],
        minLength :[6,"Full name must be at least 6 characters long"],
        maxLength:[50,"Full name must be at most 50 characters long"],
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:[true,"Email must be unique"],
        lowercase:true,
        trim:true,
        match:[/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/,"Email is invalid"]
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minLength:[8,'Password mus be atleast 8 characters'],
        select:false
    },
    role:{
        type:String,
        enum:['USER','ADMIN'],
        default:'USER'
    },
    avatar : {
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        }
    },
    forgotPasswordToken:String,
    forgotPasswordExpiry:Date,
    time_stamps:
    {
        timestamps : true
    }
});

userSchema.pre('save',async ()=>{
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password,10);
})

userSchema.methods =  {
    comparePassword : async function (plainTextPassword){
        return await bcrypt.compare(plainTextPassword,this.password);
    },
    generateJWTToken : function (){
        return jwt.sign(
            { id: this._id,role: this.role, email: this.email, subscription : this.subscription  },
            process.env.JWT_SECRET ,
            {
                expiresIn : process.env.JWT_EXPIRY
            }
        )
    }
} 

const User = model('User',userSchema);

module.exports = User;
