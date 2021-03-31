
let WIDTH,HEIGHT

let canvas = document.createElement("canvas")
let ctx = canvas.getContext("2d")
document.querySelector("#app").appendChild(canvas)

let COLORS = {
   sky: "#112233"
}

function resize(){
   WIDTH = window.innerWidth
   HEIGHT = window.innerHeight
   canvas.width = WIDTH 
   canvas.height = HEIGHT 
}

window.onresize = resize

function fill(color){
   let {width,height} = canvas
   ctx.fillStyle = color
   ctx.fillRect(0,0,width,height)
}

let ECS = {
   position: [],
   color: [],
   size: [],
   vector: [],
   direction: [],
}

function Index(){
   return {
      idx: 0,
      next(){
         if(this.idx>1000){
            this.idx = 0
         }
         this.idx ++
         return this.idx
      }
   }
}

let index = new Index()

function spawn_cloud(){
   let idx = index.next()
   ECS.position[idx] = [WIDTH/2,HEIGHT/2]
   ECS.color[idx] = "white"
   ECS.size[idx] = 0.01 
   ECS.vector[idx] = [
      -0.5+(1*Math.random()),
      -0.5+(1*Math.random()),
   ]
}

function magnitude(vector){
   return Math.abs(vector[0]) + Math.abs(vector[1])
}

function vec_add(a,b){
   return [a[0] + b[0],a[1] + b[1]]
}

function vec_mul(a,f){
   return [a[0]*f,a[1]*f]
}

function grower(ecs){
   function inner(){
      ecs.size.forEach((size,idx)=>{
         ecs.size[idx] = size + (magnitude(ecs.vector[idx])*0.05)
      })
   }
   return inner 
}

function colorshifter(ecs){
   function inner(){
      ecs.color = ecs.color.map((_,idx)=>{
         let grad = Math.min(magnitude(ecs.vector[idx])*0.2,1)
         let r = 100 + (grad * 155) 
         let g = 255 - (r/2)
         let b = 255 - (r*0.5)
         return `rgb(${r},${g},${b})`
      })
   }
   return inner
}

function mover(ecs){
   function inner(){
      ecs.position = ecs.position.map((pos,idx)=>{
         pos[0] = pos[0] + ecs.vector[idx][0]
         pos[1] = pos[1] + ecs.vector[idx][1]
         return pos
      })
   }
   return inner
}

function speeder(ecs){
   function inner(){
      ecs.vector = ecs.vector.map(vec=>{
         return vec_add(vec,vec_mul(vec,0.025)) 

      })
   }
   return inner
}

function render(ecs,ctx){
   function inner(){
      ecs.position.forEach((pos,idx)=>{
         let [x,y] = pos
         ctx.fillStyle = ecs.color[idx]
         ctx.fillRect(x,y,ecs.size[idx],ecs.size[idx])
      })
   }
   return inner
}

function cleanup(ecs){
   function inner(){
      ecs.position.forEach((pos,idx)=>{
         let oob = false
         oob = oob | pos[0] < -100 
         oob = oob | pos[0] > WIDTH+100
         oob = oob | pos[1] < -100
         oob = oob | pos[1] > HEIGHT+100
         if(oob){
            Object.keys(ecs).forEach(k=>{
               delete(ecs[k][idx])
            })
         }
      })
   }
   return inner
}

let systems = [
   cleanup(ECS),
   mover(ECS),
   render(ECS,ctx),
   grower(ECS),
   speeder(ECS),
   colorshifter(ECS),
]

function main(){
   fill(COLORS.sky)
   if(Math.random()<0.8){
      spawn_cloud()
   }
   systems.forEach(sys=>sys())
   requestAnimationFrame(main)
}

resize()
main()

