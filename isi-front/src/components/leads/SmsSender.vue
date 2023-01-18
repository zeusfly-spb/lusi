<template>
    <span>
        <v-btn
            icon
            class="p-0 m-0"
            title="Отправить SMS"
            :disabled="!enabled"
            @click="showDialog"
        >
            <v-icon
                title="Отправить SMS"
                :disabled="!enabled"
                @click="showDialog"
                color="green"
            >
                sms
            </v-icon>
        </v-btn>
        <v-dialog
            v-model="dialog"
            max-width="600px"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title
                    class="light-blue darken-3 title"
                >
                    <v-icon
                        color="white"
                        class="pr-1"
                    >
                        sms
                    </v-icon>
                    <span
                        class="white--text"
                    >
                        Отправить СМС <span v-if="lead">по заявке от клиента <strong>{{ $store.getters.truncate(lead.name, 12) }}</strong></span>
                    </span>
                </v-card-title>
                <v-card-text>
                    <v-layout
                        v-if="canUseTemplate"
                    >
                        <v-switch
                            class="left"
                            v-model="useTemplate"
                            label="Из шаблона"
                        />
                        <v-select
                            v-if="useTemplate"
                            class="right"
                            v-model="selectedTemplateId"
                            item-text="name"
                            item-value="id"
                            single-line
                            :items="templates"
                        />
                    </v-layout>
                    <v-text-field
                        autofocus
                        v-if="!phone && dialog"
                        v-model="inputNumber"
                        label="Телефон"
                        data-vv-as="Номер телефона"
                        data-vv-name="phone"
                        :error-messages="errors.collect('phone')"
                        v-validate="'required|digits:10'"
                        mask="(###) ### - ####"
                    />
                    <v-textarea
                        flat
                        class="pt-2"
                        solo
                        outline
                        v-model="inputText"
                        label="Текст сообщения"
                        data-vv-as="Текст"
                        data-vv-name="text"
                        :readonly="useTemplate"
                        :error-messages="errors.collect('text')"
                        v-validate="'required'"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn color="darken-1" flat @click="dialog = false">Отмена</v-btn>
                    <v-btn color="green darken-1" flat
                           :disabled="process"
                           @click="sendSMS"
                    >
                        Отправить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </span>
</template>

<script>
    export default {
        name: 'SmsSender',
        props: {
            phone: {
                type: String,
                required: false
            },
            lead: {
                type: Object,
                required: false
            }
        },
        data: () => ({
            process: false,
            selectedTemplateId: null,
            useTemplate: false,
            dialog: false,
            inputNumber: '',
            inputText: ''
        }),
        computed: {
            selectedTemplate () {
                return this.templates.find(item => +item.id === +this.selectedTemplateId) || null
            },
            canUseTemplate () {
                return this.leadHasEvent && this.templates.length
            },
            leadHasEvent () {
                return this.lead && this.lead.event
            },
            templates () {
                return this.$store.state.catalog.notifyTemplates
            },
            telNumber () {
                if (this.phone) {
                    return this.phone[0] === '+' && this.phone[1] === '7' ? this.phone : '+7' + this.phone
                } else {
                    return '+7' + this.inputNumber
                }
            },
            enabled () {
                return !!this.$store.getters.workingIsland
            }
        },
        methods: {
            showDialog () {
                this.dialog = true
            },
            hideDialog () {
                this.dialog = false
            },
            sendSMS () {
                const send = () => {
                    this.process = true
                    this.$store.dispatch('sendSMS', {
                        number: this.telNumber,
                        text: this.inputText
                    })
                        .then(() => this.hideDialog())
                        .finally(() => this.process = false)
                }
                this.$validator.validate()
                    .then(res => res ? send() : null)
            }
        },
        created () {
            this.lead && !this.$store.state.catalog.notifyTemplates.length ? this.$store.dispatch('setCatalogs') : null
        },
        watch: {
            useTemplate (val) {
                if (val) {
                    if (!!this.selectedTemplate) {
                        this.inputText = this.$store.getters
                            .templateSubstitute({
                                text: this.selectedTemplate.text,
                                type: 'lead',
                                entity: this.lead
                            })
                        // this.inputText = this.selectedTemplate.text
                    }
                    !this.selectedTemplateId ? this.selectedTemplateId = this.templates[0].id : null
                } else {
                    this.selectedTemplateId = null
                }
            },
            selectedTemplate (val) {
                if (!!val && this.lead) {
                    this.inputText = this.$store.getters
                        .templateSubstitute({
                            text: val.text,
                            type: 'lead',
                            entity: this.lead
                        })
                    // this.inputText = val.text, 'lead', this.lead
                } else {
                    this.inputText = ''
                }
            },
            templates (val) {
                val.length ? this.selectedTemplateId = val[0].id : null
            },
            dialog (val) {
                this.$validator.pause()
                this.$nextTick(() => {
                    this.$validator.errors.clear()
                    this.$validator.fields.items.forEach(field => field.reset())
                    this.$validator.fields.items.forEach(field => this.errors.remove(field))
                    this.$validator.resume()
                })
                val ? [this.inputNumber, this.inputText] = ['', ''] : null
                !val ? this.useTemplate = false : null
            }
        }
    }
</script>

<style scoped>

</style>
