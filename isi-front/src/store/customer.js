import Vue from 'vue'
export default {
    actions: {
        extendCustomer ({commit}, id) {
            return new Promise((resolve, reject) => {
                console.log('Extending customer')
                Vue.axios.post('/api/extend_customer', {customer_id: id})
                    .then(res => {
                        resolve(res.data)
                    })
                    .catch(e => reject(e))
            })
        }
    }
}
