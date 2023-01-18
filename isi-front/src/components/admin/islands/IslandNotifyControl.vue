<template>
    <v-sheet
        class="p-0 m-0 mb-1 round-corner"
        elevation="2"
        color="light-green lighten-5"
    >
         <span
             class="pl-2 text-center body-2"
         >
            Оповещения
        </span>
        <v-layout
            class="pl-2 pr-2 option-layout p-0 m-0"
        >
            <span
                class="left option-label ml-1"
            >
                Напоминание в начале дня
            </span>
            <v-select
                    v-model="dayStartNotifyTemplateId"
                    :items="[...notifyTemplates, {name_short: 'Нет', id: null}]"
                    style="max-width: 15em"
                    item-text="name_short"
                    item-value="id"
                    class="p-0 m-0 reminder-select"
                    single-line
            >
                <template v-slot:item="{item}">
                    <span
                        :class="{'red--text': item.id === null}"
                    >
                        {{ item.name_short }}
                    </span>
                </template>
                <template v-slot:selection="{item}">
                    <span
                        :class="{
                            'purple--text accent-4': !!item.id,
                            'grey--text': !item.id
                        }"
                    >
                        <strong>{{ item.name_short }}</strong>
                    </span>
                </template>
            </v-select>
        </v-layout>
        <v-layout
            class="option-layout pr-2 pl-2 m-0"
        >
            <div
                class="left option-label ml-1"
            >
                Предварительное напоминание
            </div>
            <v-select
                v-model="eventReminder"
                :items="eventReminderOptions"
                :disabled="!notifyTemplates.length"
                style="max-width: 12em"
                item-text="title"
                item-value="value"
                class="p-0 m-0 reminder-select"
                single-line
            >
                <template v-slot:item="{item}">
                    <span
                            :class="{'red--text': item.value === null}"
                    >
                        {{ item.title }}
                    </span>
                </template>
                <template v-slot:selection="{item}">
                    <span
                            :class="{
                            'green--text': !!item.value,
                            'grey--text': !item.value
                        }"
                    >
                        <strong>{{ item.title }}</strong>
                    </span>
                </template>
            </v-select>
            <span
                v-if="eventReminder"
                class="pl-1"
            >
                Шаблон:
            </span>
            <v-select
                v-if="eventReminder"
                v-model="eventReminderTemplateId"
                :items="notifyTemplates"
                style="max-width: 15em"
                item-text="name_short"
                item-value="id"
                class="p-0 m-0 reminder-select"
                single-line
            >
                <template v-slot:item="{item}">
                    <span
                            :class="{'red--text': item.id === null}"
                    >
                        {{ item.name_short}}
                    </span>
                </template>
                <template v-slot:selection="{item}">
                    <span
                            :class="{
                                'purple--text accent-4': !!item.id,
                                'grey--text': !item.id
                            }"
                    >
                        <strong>{{ item.name_short }}</strong>
                    </span>
                </template>
            </v-select>
        </v-layout>
        <v-layout
            class="option-layout p-0 m-0"
        >
            <div
                class="pl-2 left option-label ml-1"
            >
                Уведомление о назначении записи
            </div>
            <v-select
                v-model="createNotifyTemplateId"
                :items="[...notifyTemplates, {name_short: 'Нет', id: null}]"
                item-text="name_short"
                item-value="id"
                class="p-0 m-0 mr-2 reminder-select"
                single-line
            >
                <template v-slot:item="{item}">
                    <span
                            :class="{'red--text': item.id === null}"
                    >
                        {{ item.name_short}}
                    </span>
                </template>
                <template v-slot:selection="{item}">
                    <span
                            :class="{
                            'purple--text accent-4': !!item.id,
                            'grey--text': !item.id
                        }"
                    >
                        <strong>{{ item.name_short }}</strong>
                    </span>
                </template>
            </v-select>
        </v-layout>
    </v-sheet>
</template>

<script>
    export default {
        name: 'IslandNotifyControl',
        props: {
            island_id: Number
        },
        data: () => ({
            island: null
        }),
        computed: {
            notifyTemplates () {
                let base = JSON.parse(JSON.stringify(this.$store.state.catalog.notifyTemplates))
                return base.map(item => ({
                    ... item,
                    name_short: this.$store.getters.truncate(item.name, 30)
                }))
            },
            eventReminderOptions () {
                return this.$store.state.informer.eventReminderOptions
            },
            dayStartNotifyTemplateId: {
                get () {
                    const value = () => this.island.options.DayStartNotifyTemplateId || null
                    return this.island && this.island.options ? value() : null
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'DayStartNotifyTemplateId',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            },
            createNotifyTemplateId: {
                get () {
                    const value = () => this.island.options.CreateNotifyTemplateId || null
                    return this.island && this.island.options ? value() : null
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'CreateNotifyTemplateId',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            },
            eventReminder: {
                get () {
                    return this.island && this.island.options && this.island.options.EventReminder || null
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'EventReminder',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            },
            eventReminderTemplateId: {
                get () {
                    return this.island && this.island.options && this.island.options.EventReminderTemplateId || null
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'EventReminderTemplateId',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            }
        },
        methods: {
            setIsland () {
                this.island = this.$store.state.islands.find(item => +item.id === +this.island_id)
            }
        },
        created () {
            this.setIsland()
        },
        watch: {
            eventReminder (val) {
                if (!!val && !this.eventReminderTemplateId) {
                    console.log('Setting first value template id')
                    this.eventReminderTemplateId = this.notifyTemplates[0].id || null
                }
            }
        }
    }
</script>

<style scoped>
    .reminder-select {
        padding-left: 1em;
    }
    .option-layout {
        margin-top: 0!important;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .option-label {
        padding-right: 1em;
        color: rgba(0, 0, 0, 0.54);
    }

</style>
