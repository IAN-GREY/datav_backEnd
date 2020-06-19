const foo = {
    data: {
        g: 3
 
    },
    methods: {
        fn() {
 
        }
    }
}
 
const bar = {
    data: {
        dog: 2
    },
    methods: {
        barFn() {
 
        }
    }
}
const example = {
    data: {
        dog: 222
    },
    methods: {
        barFn3a() {
 
        }
    },
    create:{
        con(){
            console.log(1)
        }
    }
}
function deepMixins(...objArr) {
    console.log(objArr)
    let ret = {}
    function handler(key, source, ret) {
        let isObj = typeof source[key] == "object" //判断是否是对象
        if (isObj) {
            if (!ret[key]) {
                ret[key] = {} //键名不存在，拷贝键名
 
            }
            // 由于是对象、递归深度拷贝
            Object.keys(source[key]).forEach((_key) => {
                handler(_key, source[key], ret[key])
            })
        } else {
            // 是非引用类型、直接拷贝键名所对应的值
            ret[key] = source[key]
        }
 
    }
    // 遍历需要拷贝的对象、逐一深度拷贝
    objArr.forEach((obj, idx, _self) => {
        Object.keys(obj).forEach((key) => {
            handler(key, obj, ret)
        })
    })
    return ret
}
console.log(deepMixins(foo, bar,example))