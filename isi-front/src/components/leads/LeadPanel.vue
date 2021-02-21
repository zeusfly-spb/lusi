<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-flex>
        <island-switcher
            v-if="isSuperadmin"
        />
        <view-mode-switcher
                v-model="currentViewMode"
        />
        <div class="mb-2"
             v-if="!todayPostpones"
        >
            <v-text-field
                    class="right"
                    style="width: 23em"
                    v-model="searchString"
                    append-icon="search"
                    label="Начните вводить данные для поиска..."
                    single-line
                    hide-details
                    :readonly="busy || $store.state.paginator.loading"
                    @input="lazyQuerySelection"
            />
        </div>
        <v-data-table
            class="elevation-1"
            :loading="$store.state.paginator.loading"
            :headers="headers"
            :items="leads"
            :total-items="$store.state.paginator.total"
            :rows-per-page-items="rowOptions"
            :hide-actions="byQuery"
            rows-per-page-text="Заявок на странице"
            @update:pagination="updatePagination"
        >
            <template v-slot:items="props">
                <lead :props="props" />
            </template>
            <template v-slot:no-data>
                <span class="red--text">Нет заявок</span>
            </template>
        </v-data-table>
        <lead-remover/>
        <lead-event-adder/>
        <event-editor
                v-if="editedEvent"
                :event="editedEvent"
                @close="$store.commit('SET_EDITED_EVENT', null)"
        />
    </v-flex>
</template>
<script>
    import Lodash from 'lodash'
    import Lead from './Lead'
    import ViewModeSwitcher from './ViewModeSwitcher'
    import LeadRemover from './LeadRemover'
    import LeadEventAdder from './LeadEventAdder'
    import IslandSwitcher from '../IslandSwitcher'
    import EventEditor from '../appointments/EventEditor'
    import SmsSender from './SmsSender'

    const sortByTime = (a, b) => {
        let timeA = a.time
        let timeB = b.time
        return timeA === timeB ? 0 : timeA < timeB ? -1 : 1
    }

    export default {
        name: 'LeadsPanel',
        data: () => ({
            switching: false,
            busy: false,
            searchString: '',
            rowOptions: [
                15,
                30,
                50,
                { text: "Все", value: -1 }
            ],
            headers: [
                {text: '', value: null, sortable: false, width: '5px'},
                {text: '#', value: 'id', sortable: false, width: '5px'},
                {text: 'Имя', value: 'name', sortable: false},
                {text: 'Телефон', value: 'phone', sortable: false},
                {text: 'Запись', value: null, sortable: false},
                {text: 'Дата перезвона', value: 'phone', sortable: false},
                {text: 'Источник', value: 'site', sortable: false},
                {text: 'Комментарии', value: null, sortable: false},
                {text: 'Дата/Время', value: 'created_at', sortable: false},
                {text: 'Действия', value: null, sortable: false}
            ]
        }),
        computed: {
            perPage () {
              return this.$store.state.paginator.per_page
            },
            page () {
              return this.$store.state.paginator.page
            },
            byQuery () {
                return !!this.searchString.length
            },
            currentViewMode: {
                get () {
                    return this.$store.state.loader.leadStatus
                },
                set (val) {
                    this.$store.dispatch('changeLeadStatus', val)
                }
            },
            editedEvent () {
                return this.$store.state.appointment.editedEvent
            },
            callTodayLeads () {
                return this.$store.state.loader.callTodayLeads || []
            },
            todayPostpones () {
                return this.$store.state.loader.showTodayPostpones
            },
            lazyQuerySelection () {
                return Lodash.debounce(this.setLeadName, 500)
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            leads () {
              const getTime = date => {
                let time = date.includes('T') ? date.split('T')[1] : date.split(' ')[1]
                return time.includes('.') ? time.split('.')[0] : time
              }
              let base = JSON.parse(JSON.stringify(this.$store.state.loader.leads))
              if (this.todayPostpones) {
                base = base.map(item => ({
                  ...item,
                  time: item.last_postpone ? getTime(item.last_postpone.date) : null
                })).sort(sortByTime)
              }
                this.$store.getters.currentLeadStatus === 'wait' ? base = base.reverse() : null
              return base
            }
        },
        methods: {
            setLeadName () {
                this.busy = true
                this.$store.dispatch('setLeadName', this.searchString)
                    .finally(() => this.busy = false)
            },
            updatePagination (data) {
                this.$store.dispatch('updatePagination', data)
            }
        },
        watch: {
            todayPostpones () {
              this.$store.commit('RESET_PAGINATOR')
            },
            currentViewMode () {
                this.$store.commit('SET_OPEN_LEAD_ID', null)
            }
        },
        components: {
            Lead,
            ViewModeSwitcher,
            LeadRemover,
            LeadEventAdder,
            IslandSwitcher,
            EventEditor,
            SmsSender
        }
    }
</script>

