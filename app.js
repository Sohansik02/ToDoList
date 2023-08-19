

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require('mongoose');
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sohansikdar02:test123@cluster0.s0yxwqu.mongodb.net/todolistDB");

const itemschema=new mongoose.Schema({
  name:String
});

const Item=mongoose.model("item",itemschema);
const item1=new Item({
  name:"Welcome to TodoList v2"
});
const item2=new Item({
  name:"Click add Button to Add Data"
});
const item3=new Item({
  name:"<-uncheck the box to delete item"
});

const defaultitems=[item1,item2,item3];



const day = date.getDate();
app.get("/", function(req, res) {

  Item.find().then(function(data){
    if(data.length===0){
      Item.insertMany(defaultitems);
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: day, newListItems: data});
    }
  })
});

app.post("/", function(req, res){

  const newitem = req.body.newItem;
  const listname=req.body.list;
  const item=new Item({
    name:newitem
  });
  if(listname===day){      //if the listname is home route then save it and redirect
    item.save();
    res.redirect("/");
  }
  else{
    //we have to find the custom list in database
      List.findOne({name:listname}).then(function(result){
        result.items.push(item);
        result.save();
        res.redirect("/"+listname);
      })
  }
});

app.post("/delete",function(req,res){
  const checkid=req.body.checkbox;
  const listname=req.body.listname;
  if(listname==day){
    Item.findByIdAndRemove(checkid).then(function(result){
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkid}}}).then(function(result){
    });
    res.redirect("/"+listname);
  }
});

const Listschema={
  name:String,
  items:[itemschema]
};

const List=mongoose.model("list",Listschema);

app.get("/:rname",function(req,res){
  const rname=_.capitalize(req.params.rname);
  List.findOne({name:rname}).then(function(result){
      if(!result){
        const list=new List({
          name:rname,
          items:defaultitems
        });
        list.save();
        res.redirect("/"+rname);
      }
    else{
      res.render("list",{listTitle:result.name,newListItems:result.items});
    }
  });
  
});
app.post("/suggest",function(req,res){
  const searchelm=_.capitalize(req.body.sugg);
  res.redirect("/"+searchelm);
})
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
