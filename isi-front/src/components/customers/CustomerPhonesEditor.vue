<template>
    <v-flex>
        <div class="blue-grey--text">Телефоны:</div>
        <div v-for="phone in customer.phones" :key="phone.id">
            <phone-viewer
                :phone="phone.number"
            />
            <caller
                :phone="phone.number"
            />
            <v-icon
                class="red--text"
                small
                @click="deletePhone(phone.id)"
                title="Удалить"
                v-if="customer.phones && customer.phones.length > 1"
            >
                delete
            </v-icon>
        </div>
        <div v-if="!customer.phones || !customer.phones.length" class="red--text">Нет телефонов</div>
        <v-text-field
            label="Номер"
            v-show="adding"
            v-model="newNumber"
            data-vv-as="Номер телефона"
            data-vv-name="phone"
            :error-messages="errors.collect('phone')"
            v-validate="'required|digits:10'"
            mask="(###) ### - ####"
            ref="newNumber"
        />
        &nbsp;
        <v-icon
            class="green--text"
            small
            @click="addPhone"
            title="Сохранить"
            v-if="adding"
        >
            save
        </v-icon>

        <a href="#" @click="turnAddingOn" v-if="!adding" style="text-decoration: none">
            Добавить номер
        </a>

        <v-icon
            class="red--text"
            small
            @click="adding = false"
            title="Отмена"
            v-if="adding"
        >
            cancel
        </v-icon>


    </v-flex>
</template>
<script>
    import Caller from '../leads/Caller'
    import PhoneViewer from '../main/PhoneViewer'
    export default {
        name: 'CustomerPhonesEditor',
        props: ['customer'],
        data: () => ({
            adding: false,
            newNumber: ''
        }),
        methods: {
            turnAddingOn () {
                this.newNumber = ''
                this.adding = true
            },
            addPhone () {
                this.$validator.validate()
                    .then(valid => {
                        if (!valid) return
                        this.$store.dispatch('addCustomerPhone', {customer_id: this.customer.id, number: this.newNumber})
                            .then((res) => {
                                this.customer.phones = res.data.phones
                                this.adding = false
                            })
                    })
            },
            deletePhone (id) {
                let params = {customer_id: this.customer.id, phone_id: id}
                this.$store.dispatch('deleteCustomerPhone', params)
                    .then(() => this.customer.phones = this.customer.phones.filter(item => +item.id !== +id))
            }
        },
        watch: {
            adding (val) {
                if (val) {
                    this.$emit('addOn')
                } else {
                    this.$emit('addOff')
                }
            }
        },
        components: {
            Caller,
            PhoneViewer
        }
    }
</script>
