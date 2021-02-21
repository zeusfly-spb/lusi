<template>
    <div>
        <div v-for="phone in phones" :key="phone.id">
            <phone-viewer
                :phone="phone.number"
            />
            <caller
                :phone="phone.number"
            />
        </div>
    </div>
</template>
<script>
    import Caller from '../leads/Caller'
    import PhoneViewer from '../main/PhoneViewer'
    export default {
        name: 'CustomerPhonesColumn',
        props: ['phones'],
        filters: {
            phone: function (val) {
                String.prototype.replaceAt = function(index, replacement) {
                    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
                }
                return '+7 ' + val.replace(/[^0-9]/g, '')
                    .replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
                    .replaceAt(6, '*').replaceAt(7, '*').replaceAt(8, '*')
            }
        },
        components: {
            Caller,
            PhoneViewer
        }
    }
</script>
