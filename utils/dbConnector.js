let mongoose=require('mongoose');

async function connect(){
    try {
        await mongoose.connect(global.mongodbConnectionAddress, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
          });
           console.log('Now connected to MongoDB!')
    } catch (error) {
        console.log(error);
    }
   
}
module.exports={
    connect
}