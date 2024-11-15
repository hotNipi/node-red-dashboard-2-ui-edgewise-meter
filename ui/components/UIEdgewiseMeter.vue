<template>   
    <div class="hotnipi-ewm-wrapper" :class="class" :style="styles">
        <div v-if="label" class="hotnipi-ewm-label">{{label}}</div>
        <div class="hotnipi-ewm-body" :class="{'hotnipi-ewm-dark': dark, 'hotnipi-ewm-light': !dark}">
            <div ref="display" class="hotnipi-ewm-display">
                <div class="hotnipi-ewm-backplate">
                    <div ref="plate" class="hotnipi-ewm-numbers" >
                        <div v-for="(n, index) in numbers" :key="index" class="hotnipi-ewm-num">{{n}}</div>                                    
                    </div>
                    <div v-if="sizeError" class="hotnipi-ewm-size-error hotnipi-ewm-blonk">
                       <p>The configured size is too small. The digits cannot be placed in exact locations.</p>
                    </div>
                </div>
                <div ref="needle" class="hotnipi-ewm-needle"></div>
            </div>
            <div v-if="'miniDisplay != none'" class="hotnipi-ewm-exact" :class="miniDisplayProps"><p>{{ formatted }}</p></div>    
        </div>
    </div>    
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'UIEdgewiseMeter',
    inject: ['$socket'],
    props: {
        /* do not remove entries from this - Dashboard's Layout Manager's will pass this data to your component */
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({ enabled: false, visible: false }) }
    },
    setup (props) {
        //console.info('UIGaugeLinear setup with:', props)
        //console.debug('Vue function loaded correctly', markRaw)        
    },
    data() {           
        return {              
            min:0,
            max:10,
            count:20,   
            size:800,
            dark:false, 
            sectors:[{start:0,color:"lightblue"},{start:3,color:"transparent"},{start:7,color:"#ffc55c"},{start:9,color:"#fc5b5b"}],
            label:"T-out °C",
            smallDigits:true,
            precision:1,                
            animation:"ease",
            logo:"",
            unit:"",


            //local 
            value:0,
            sizeError:false,
            timeout:null,
            styles:{},
            numbers:[0],
            rounder:100,
            class: "",
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        formatted:function(){
            return (Math.round(this.value * this.rounder) / this.rounder).toString().concat(this.unit) ;
        }
    },
    methods: {
        
        applyProperties: function(){ 
          //  console.log(this.props)           
            this.min = Number(this.props.min)
            this.max = Number(this.props.max)
            this.count = Number(this.props.count)
            this.size = Number(this.props.displaysize)
            this.sectors = this.props.sectors
            this.precision = Number(this.props.precision);
            this.dark = this.props.dark
            this.smallDigits = this.props.smallDigits
            this.logo = this.props.logo 
            this.unit = this.props.unit ?? "";
            this.label = this.props.label
            this.animation = this.props.animation
            this.class = this.props.myclass+" "+this.props.miniDisplay
            this.miniDisplay = this.props.miniDisplay
            this.miniDisplayProps = this.props.miniDisplayProps.split('-').join(" ")
            this.value = this.min
            this.rounder = Math.max(this.precision, 100)
        },
        
        generateNumbers:function(){
            const t = ((this.max * this.precision) - (this.min * this.precision)) / this.count;                 
            let i = this.min * this.precision;
            let r = []
            for (let e = 0; e < this.count+1; ++e){
                r.push(i)
                i += t;
            }
            r = r.map(n => n / this.precision)
            this.numbers = r
        },
        generateStyles:function() {
            this.styles = {                   
                "--hotnipi-ewm-logo": this.logo ? JSON.stringify(this.logo) : undefined,
                "--hotnipi-ewm-size": this.size,
                "--hotnipi-ewm-small-digits":this.smallDigits ? "small" : "inherit",
                "--hotnipi-ewm-gradient":this.sectorGradient(),
                "--hotnipi-ewm-mini-display-size":this.miniDisplaySize(),
                "--hotnipi-ewm-easing":this.animation == "none" ? "unset" : this.animation == "ease" ? "left 1s ease-in-out" : "left 1s cubic-bezier( 0.6, 0.06, 0.132, 1.15 )",
                "grid-template-columns":this.label ? "auto 1fr" : "1fr",
            }
        },  
        miniDisplaySize:function(){
            
            const mi = Math.abs(this.min)
            const ma = Math.abs(this.max)
            const n = Math.max(mi,ma).toString().length
            const u = this.unit?.length ?? 0
            const r = Number(n + u + this.rounder.toString().length)
            return  r
        },
        
            
        sectorGradient: function(){
            let gradient = "repeating-linear-gradient(to right, #00000040, #00000040 40%, transparent 40%, transparent)"
            
            if(this.sectors.length == 0){
                return gradient
            }
            gradient = gradient.concat(', linear-gradient(to right,')
            let pos
            let total = this.sectors.length -1
            
            this.sectors.forEach((s,i) => {
                if(i == 0){
                    if(s.start == this.min){
                        gradient = gradient.concat(s.color,", ")
                        if(i==total){
                            gradient = gradient.concat(s.color)
                        }
                        else if(i + 1 <= total){
                            pos = this.position(this.sectors[i+1].start).toString()
                            gradient = gradient.concat(s.color," ",pos,"%, ")
                        }
                    }
                    else{
                        gradient = gradient.concat('transparent, transparent ')
                        pos = this.position(s.start).toString()
                        gradient = gradient.concat(pos,"%, ")
                        if(i == total){
                            pos = this.position(s.start).toString()
                            gradient = gradient.concat(s.color," ",pos,"%, ")
                            gradient = gradient.concat(s.color)
                        }
                        else if(i + 1 <= total){
                            pos = this.position(s.start).toString()
                            gradient = gradient.concat(s.color," ",pos,"%, ")
                            pos = this.position(this.sectors[i+1].start).toString()
                            gradient = gradient.concat(s.color," ",pos,"%, ")
                        }
                    }
                }
                else if(i == total){
                    pos = this.position(s.start).toString()
                    gradient = gradient.concat(s.color," ",pos,"%, ")
                    gradient = gradient.concat(s.color)
                } 
                else{
                    pos = this.position(s.start).toString()
                    gradient = gradient.concat(s.color," ",pos,"%, ")
                    if(i + 1 <= total){
                        pos = this.position(this.sectors[i+1].start).toString()
                        gradient = gradient.concat(s.color," ",pos,"%, ")
                    }
                }
            })
            gradient = gradient.concat(")")
            return gradient
        },
        range :function (n, p, a, r) {
            if (a == "clamp") {
                if (n < p.minin) { 
                    n=p.minin; 
                } 
                if (n> p.maxin) {
                    n = p.maxin;
                }
            }
            if (a == "roll") {
                let d = p.maxin - p.minin;
                n = ((n - p.minin) % d + d) % d + p.minin;
            }
            let v = ((n - p.minin) / (p.maxin - p.minin) * (p.maxout - p.minout)) + p.minout;
            if (r) {
                v = Math.round(v);
            }
            return v
        },
        
        position: function(target){
            const v = target ?? this.value
            const l = this.size/(this.count+1)/2
            const d = l * 100 / this.size                
            let p = ((v - this.min) / (this.max - this.min)) * 100
            p = target ? p : 100 - p

            const params = {minin:0, maxin:100, minout:d, maxout:100-d};
            return this.range(p,params)
        },
        
        
        validate:function(data){          
            let ret
            if(typeof data !== "number"){
                ret = parseFloat(data)
                if(isNaN(ret)){
                    //console.log("BAD DATA! type:",this.type, "id:",this.id,"data:",data)
                    return null
                }   
            }
            else{
                ret = data
            }            
            return ret
        },
        move:function(){
            const plate = this.$refs.plate;
            const display = this.$refs.display;
            if(!display || !plate){
                return
            }
            plate.style.left = this.position()+"%"  
        },

        onPayload:function(msg) {           
            if(msg?.payload != undefined){
                const v = this.validate(msg.payload)                
                if(v !== null){
                    this.value = v                
                    this.move()
                }
            }
            let update = false
            if (msg.ui_update?.label  &&  typeof msg.ui_update.label === 'string') {
                this.label = msg.ui_update.label
            }
            if (msg.ui_update?.min && typeof msg.ui_update?.min === 'number') {
                this.min = msg.ui_update.min
                update = true               
            }
            if (msg.ui_update?.max  && typeof msg.ui_update?.max === 'number') {
                this.max = msg.ui_update.max
                update = true                
            }
            if (msg.ui_update?.precision  && typeof msg.ui_update?.precision === 'number') {
                this.precision = msg.ui_update.precision
                update = true                
            }
            if (msg.ui_update?.count  && typeof msg.ui_update?.count === 'number') {
                this.count = msg.ui_update.count
                update = true                
            }
           
            if (msg.ui_update?.displaysize  && typeof msg.ui_update?.displaysize === 'number') {
                this.size = msg.ui_update.displaysize
                update = true                
            }
            if(update){
                this.generateNumbers()            
            }

            if (Array.isArray(msg.ui_update?.sectors)) {
                this.sectors = msg.ui_update.sectors 
                this.generateStyles()                           
            }  
        },
        checkSize:function(){
            this.timeout = setTimeout(()=>{
                const plate = this.$refs.plate;
                const needle = this.$refs.needle
                if(!plate || !needle){
                    this.timeout = null
                    return
                }
                let w = 0                
                Array.from(plate.children).forEach(n => {
                    w += parseFloat(getComputedStyle(n).getPropertyValue('width'))                   
                })
                if(w - this.size > 0.2){ 
                    this.sizeError = true             
                    plate.classList.add('hotnipi-ewm-blink')
                    needle.classList.add('hotnipi-ewm-blink')
                }
                this.timeout = null
            },100) 
        }        
    },
    mounted() {
        this.$socket.on('widget-load:' + this.id, (msg) => {           
           this.onPayload(msg) 
        })
        this.$socket.on('msg-input:' + this.id, (msg) => {
            this.onPayload(msg)                        
            this.$store.commit('data/bind', {widgetId: this.id, msg})
        })

        this.applyProperties()
        this.generateNumbers()
        this.generateStyles()
        this.move()

        this.$socket.emit('widget-load', this.id) 

        this.checkSize()
    },
    unmounted() {
        if(this.timeout){
            clearTimeout(this.timeout)
            this.timeout = null
        }
        this.$socket?.off('widget-load:' + this.id)
        this.$socket?.off('msg-input:' + this.id)
    }
}
</script>
<style scoped>
    @import "../stylesheets/ui-edgewise-meter.css";
</style>
