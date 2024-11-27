module.exports = function (RED) {
    function UIEdgewiseMeterNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const base = group.getBase()

        // initialise data store on startup or deploy
        base.stores.data.save(base, node, {})

        // server-side event handlers
        const evts = {
            onAction: true,
            onInput: function (msg, send, done) {                
                // pick up existing stored data
                let storedData = base.stores.data.get(node.id) 
                
                let val = RED.util.getMessageProperty(msg, config.property)                         
                if (typeof val != "undefined") {
                    storedData.payload = val
                    msg.payload = val                    
                }
                //console.log(`onInput storedData: ${JSON.stringify(storedData)}\n\n`)

                // does msg.ui_update exist and is an object?
                if (typeof msg.ui_update === 'object' && !Array.isArray(msg.ui_update) && msg.ui_update !== null) {
                    // yes it does
                    storedData.ui_update ??= {}    // initialise if necessary
                    // merge in data from this message
                    storedData.ui_update = {...storedData.ui_update, ...msg.ui_update}
                } else {
                    // delete any msg.ui_update so don't need to validate in clients
                    delete msg.ui_update
                }

                // store the latest full set of values in our Node-RED datastore
                //console.log(`leaving onInput storedData: ${JSON.stringify(storedData)}\n\n`)
                base.stores.data.save(base, node, storedData)
                // send the message with modified properties to the clients
                send(msg)
            },
            onSocket: {
                
            }
        }

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, evts)
        } else {
            node.error('No group configured')
        }
    }

    RED.nodes.registerType('ui-edgewise-meter', UIEdgewiseMeterNode)
}
