const http = require('http');
const {v4: uuidv4 } = require('uuid')
const errorHandle = require('./errorHandle');
const headers = require('./headers');
const successHandle = require('./successHandle');
const todos = []

const requestListener = (req , res) => {
    let body = "";
    req.on('data', chunk =>{
        body+=chunk;
    })
    
    console.log(req.url);
    console.log(req.method);
    if(req.url === "/todos" && req.method === "GET"){
        successHandle(res,todos)
    }else if(req.url === "/todos" && req.method === "POST"){
        req.on('end',()=>{
            try{
                const title = JSON.parse(body).title.trim()
                if(title){
                    const todo = {
                        "title": title,
                        "id": uuidv4(),
                    }
                    todos.push(todo);
                    successHandle(res,todos);
                }else{
                    errorHandle(res)
                }
            }catch(error){
                errorHandle(res)
            }
            
        })
    }else if(req.url === "/todos" && req.method === "DELETE"){
        todos.length = 0
        successHandle(res,todos);
    }else if(req.url.startsWith("/todos/") && req.method === "DELETE"){
        const id = req.url.split("/").pop();
        const index = todos.findIndex(element => element.id === id) ;
        if(index !== -1){
            todos.splice(index,1);
            successHandle(res,todos);
        }else{
            errorHandle(res);
        }
    }else if(req.url.startsWith("/todos/") && req.method === "PATCH"){
        req.on('end',()=>{
            try{
                const title = JSON.parse(body).title.trim();
                const id = req.url.split('/').pop();
                const index = todos.findIndex(element => element.id === id)
                if(title && index !== -1){
                    todos[index].title = title;
                    successHandle(res,todos);
                }else{
                    errorHandle(res);
                }
            }catch{
                errorHandle(res);
            }
        })
    }else if(req.method === "OPTIONS"){
        res.writeHead(200,headers);
        res.end();
    }else{
        res.writeHead(404,headers);
         res.write(JSON.stringify({
            "status":"false",
            "message":"無此網站路由"
        }));
        res.end();
        
    }
    
}


const server = http.createServer(requestListener);
server.listen(process.env.PORT ||3005);