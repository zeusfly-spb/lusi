<template>
    <div>
        <v-btn
            flat
            color="primary"
            @click="show"
        >
            Добавить абонемент
        </v-btn>
        <v-dialog
            v-model="active"
            max-width="1000"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title
                    class="light-blue darken-3"
                >
                    <span
                        class="white--text title"
                    >
                        {{ editMode ? `Редактировать абонемент "${editedName || ''}"` : 'Новый абонемент' }}
                    </span>
                    <v-spacer/>
                    <v-icon
                        class="clickable"
                        color="white"
                        @click="hide"
                    >
                        close
                    </v-icon>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md4>
                                <sub>Название</sub>
                                <v-text-field
                                    v-if="active"
                                    autofocus
                                    v-model="subscription.name"
                                    data-vv-as="Название"
                                    data-vv-name="name"
                                    :error-messages="errors.collect('name')"
                                    v-validate.persist="'required|max:20'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Услуга</sub>
                                <v-select
                                    v-model="subscription.service_id"
                                    :items="services"
                                    item-text="description"
                                    item-value="id"
                                    single-line
                                    data-vv-name="service"
                                    data-vv-as="Услуга"
                                    :error-messages="errors.collect('service')"
                                    v-validate.persist="'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Количество дней</sub>
                                <v-text-field
                                    v-model="subscription.number_days"
                                    type="number"
                                    data-vv-as="Количество дней"
                                    data-vv-name="number_days"
                                    :error-messages="errors.collect('number_days')"
                                    v-validate.persist="'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Количество приемов</sub>
                                <v-text-field
                                    v-model="subscription.supply_amount"
                                    type="number"
                                    data-vv-as="Количество приемов"
                                    data-vv-name="supply_amount"
                                    :error-messages="errors.collect('supply_amount')"
                                    v-validate.persist="'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Цена</sub>
                                <v-text-field
                                    v-model="subscription.base_price"
                                    type="number"
                                    data-vv-as="Цена"
                                    data-vv-name="base_price"
                                    :error-messages="errors.collect('base_price')"
                                    v-validate.persist="'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Изменяемая цена</sub>
                                <v-checkbox
                                    v-model="subscription.changeable_price"
                                />
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="hide">Отмена</v-btn>
                    <v-btn color="green darken-1" flat @click="save">Сохранить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    export default {
        name: 'SubscriptionCommander',
        data: () => ({
            editedName: null,
            active: false,
            subscription: null
        }),
        computed: {
            services () {
                return this.$store.state.catalog.services
            },
            toEdit () {
                return this.$store.state.catalog.subscriptionToEdit
            },
            editMode () {
                return !!this.toEdit
            }
        },
        methods: {
            save () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) {
                            return
                        }
                        let action = this.editMode ? 'updateSubscription' : 'createSubscription'
                        this.$store.dispatch(action, this.subscription)
                            .then(() => this.hide())
                    })
            },
            setFirstService () {
                if (!this.services.length) {
                    return
                }
                this.init()
                if (this.editMode) {
                    return
                }
                this.subscription.service_id = this.services[0].id || null
            },
            show () {
                this.active = true
            },
            hide () {
                this.active = false
                if (this.editMode) {
                    this.$store.commit('UNSET_SUBSCRIPTION_TO_EDIT')
                }
            },
            init () {
                this.subscription = this.editMode ? this.toEdit : {
                    name: '',
                    service_id: null,
                    number_days: null,
                    supply_amount: null,
                    base_price: null,
                    changeable_price: false,
                }
            }
        },
        created () {
            this.init()
        },
        watch: {
            editMode (val) {
                if (val) {
                    this.editedName = this.toEdit && this.toEdit.name || null
                    this.show()
                }
            },
            active (val) {
                this.$validator.pause()
                this.$nextTick(() => {
                    this.$validator.errors.clear()
                    this.$validator.fields.items.forEach(field => field.reset())
                    this.$validator.fields.items.forEach(field => this.errors.remove(field))
                    this.$validator.resume()
                })
                !val ? this.init() : this.setFirstService()
            },
            services (val) {
                if (val.length) {
                    this.setFirstService()
                }
            }
        }
    }
</script>
