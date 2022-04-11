const express= require("express")
const bodyParser= require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

// console.log(date());

const app =express();

app.set('view engine','ejs');     
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Sudhanshu0907:Sudhanshu0907@cluster0.imtzp.mongodb.net/todolistDB",{useNewUrlParser:true});

const todoList={
    list:String
}

const Item=mongoose.model("Item",todoList);

const item1=new Item({
    list: "Welcome to your todolist"
});

const item2=new Item({
    list: "Click + button to add"
});

const item3=new Item({
    list: "<-- Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];





const listSchema={
    name:String,
    items:[todoList]
};
const List=mongoose.model("List",listSchema);



app.get("/",function(req,res){

    Item.find({},function(err,foundItems){
        if(foundItems.length===0)
        {
            Item.insertMany(defaultItems,function(err){
                if(err)
                    console.log(err);
                else    
                    console.log("Sucessfully Inserted!");
            });
            res.redirect("/");
        }
        else
            res.render("list",{listTitle:"Today",newitems:foundItems});
        // console.log(foundItems);
    });
})


app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundList){
        if(!err)
        {
            if(!foundList)
            {
                // console.log("Doesn't exist");
                const list=new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+ customListName);
            }
            else{
                // console.log("Exist");
                res.render("list",{listTitle:foundList.name,newitems:foundList.items});
            }
        }
    });

    
});

app.post("/",function(req,res){
    // console.log(req.body);
    var item=req.body.todo1;
    const listName=req.body.list;
    const item4=new Item({
        list: item
    });

    if(listName==="Today")
    {
        item4.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item4);
            foundList.save();
            res.redirect("/"+listName);
        })
    }


    
})

app.post("/delete",function(req,res){
    // console.log(req.body);
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err)
                console.log(err);
            else    
                console.log("Sucessfully deleted!");
        });
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err)
                res.redirect("/"+listName);
        })
    }

    
});



app.get("/about",function(req,res){
    res.render("about");
})

 
let port = process.env.PORT;
if(port==null||port==""){
    port=3000;
}
app.listen(port,function(){
    console.log("Server has started sucessfully")
})