
const express = require("express");
const bodyParser = require("body-parser");
const mongoose =  require("mongoose");
const _ = require('lodash');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// make connection to db
mongoose.connect("mongodb+srv://admin-adham:adham1234@cluster0-npp4l.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true});


/************* Item *****************/
// Create Schema 
const itemSchema = new mongoose.Schema({
      name: {
        type: String,
        required: [true,"Can not add empty item to the list!"]
    }
});

// Create Model 
const Item =  mongoose.model("Item",itemSchema);

// Create doc 
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + buttom to add new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defultItem = [item1,item2,item3];


/************* List *****************/
// Create Schema 
const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true,"add name list!"],
  },
  items: [itemSchema]

});

// Create Model 
const List =  mongoose.model("List",listSchema);





// root page
app.get("/", function(req, res) {

  //TO read from db
  Item.find(function(err, items){

    if(items.length === 0)
    {
      // Defult insert if db is empty
      Item.insertMany(defultItem,function(err){
          if(err)
              console.log(err);
          else    
              console.log("Successfully saved all the items to todoistDB");
      });
      res.redirect("/");
    } else{
        res.render("list", {listTitle: "Today", newListItems: items});
    }

  });

});

// add the new item 
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  //create doc item
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundlist){


      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName);
    });
  }

});

// remove items when checkbox is on
app.post("/delete", function(req, res){

  const checkboxId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkboxId,function(err){
      if(err)
          console.log(err);
      else {
        res.redirect("/");
        console.log("Successuflly deleted the document.");  
      }
  });
  } 
  else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkboxId}}},function(err,foundlist){
        if(!err){
          res.redirect("/"+listName);
        }
    });
  }

  
});


// Dynamic pages
app.get('/:listName', function (req, res) {
  
  const requestedList  = _.capitalize(req.params.listName);

  List.findOne({name:requestedList},function(err,foundList){
      if(!err){

        if(!foundList){
         //List Not exist 
          const list = new List({
              name:requestedList,
              items:defultItem
          });
          list.save();
          res.redirect("/"+requestedList);
        }else {
          //List Exist

          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        } 
      }   

  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
