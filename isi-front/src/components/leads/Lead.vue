<template>
    <tr
        v-blur="$store.state.paginator.loading"
    >
        <td
            :class="{'mini': mini}"
            align="center"
            class="clear-td"
        >
            <v-icon
                :small="mini"
                class="red--text delete"
                title="Удалить заявку?"
                @click="confirmToDelete"
                v-if="isSuperadmin"
            >
                clear
            </v-icon>
        </td>
        <td
            :class="{'mini': mini}"
            align="center"
        >
            {{ page > 1 ? perPage * (page - 1) + props.index + 1 : props.index + 1 }}
        </td>
        <td nowrap
            :class="{'mini': mini}"
        >
            <v-menu
                style="display: inline"
                v-model="contextMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                lazy
                offset-y
                full-width
            >
                <template v-slot:activator="{ on }">
                    <v-icon
                        :small="mini"
                        style="user-select: none"
                        class="clickable"
                        title="Показать историю взаимодействия"
                        :color="props.item.customer ? 'green' : 'yellow darken-3'"
                        @click="showInteractions"
                        @contextmenu.prevent="openMenu"
                    >
                        contacts
                    </v-icon>
                </template>
                <lead-context-menu-entry
                    :lead="props.item"
                    @done="contextMenu = null"
                />
            </v-menu>
            {{ $store.getters.truncate(props.item.name, 25) | upFirst }}
            <interactions-card
                no-activator
                v-if="+interactionsOpenId === +props.item.id"
                :lead="props.item"
                :customer="props.item.customer"
                @close="interactionsOpenId = null"
            />
        </td>
        <td nowrap
            :class="{'mini': mini}"
        >
            <phone-viewer :phone="props.item.phone"/>
            <caller
                :phone="props.item.phone"
                :lead="props.item"
                :blinked="false"
            />
            <sms-sender
                :phone="props.item.phone"
                :lead="props.item"
            />
        </td>
        <td
            :class="{'mini': mini}"
        >
            <v-icon
                :style="{'cursor': !workingIsland ? 'default' : 'pointer'}"
                :small="mini"
                :color="props.item.event ? 'green' : 'grey lighten-2'"
                :title="eventControlTitle"
                @click="eventControlAction"
            >
                event
            </v-icon>
        </td>
        <td
            :class="{'mini': mini}"
        >
            <template v-if="props.item.id === openLeadId">
                <lead-postpones
                        :lead="props.item"
                        :open="props.item.id === openLeadId"
                />
            </template>
            <template v-else>
                <span
                    v-if="props.item.last_postpone"
                    class="clickable"
                    @click="showLead"
                    :class="{
                      'today': clearDate(props.item.last_postpone.date) === realDate,
                      'lost': clearDate(props.item.last_postpone.date) < realDate
                    }"
                >
                    {{ lastPostponeDate }}
                </span>
                <v-icon
                    v-else
                    class="clickable"
                    title="Добавить дату перезвона по заявке"
                    @click="showLead"
                >
                    phone_forwarded
                </v-icon>
            </template>
        </td>
        <td
            :class="{'mini': mini}"
            align="center"
            class="clear-td"
        >
            <div v-if="props.item.site && !props.item.user_id">{{ props.item.site }}</div>
            <user-avatar v-if="props.item.user_id" :user="leadUser(props.item)" :mini="mini"/>
            <v-avatar
                v-if="!props.item.site && !props.item.user_id"
                :size="mini ? '18px' : '36px'"
                title="Заявка из сети"
            >
                <img :src="basePath + '/img/www.png'" alt="Без фото" v-if="!props.item.user && !props.item.site">
            </v-avatar>
        </td>
        <td
            :class="{'mini': mini}"
        >
            <template v-if="leadCommentsId === props.item.id">
                <lead-comments
                        :lead="props.item"
                        @close="leadCommentsId = null"
                />
            </template>
            <template v-else>
                        <span v-if="props.item.last_comment"
                              @click="leadCommentsId = props.item.id"
                              class="clickable"
                        >
                            {{ props.item.last_comment.text }}
                            <span class="green--text accent-4"
                                  v-if="props.item.comments.length > 1"
                            >
                                <strong>({{ props.item.comments.length }})</strong>
                            </span>
                        </span>
                <v-icon
                        v-else
                        color="green"
                        title="Добавить комментарий к заявке"
                        class="clickable"
                        @click="leadCommentsId = props.item.id"
                >
                    add_circle
                </v-icon>
            </template>
        </td>
        <td
            :class="{'mini': mini}"
        >
            {{ props.item.created_at | moment('DD MMMM YYYY г. HH:mm') }}
        </td>
        <td
            :class="{'mini': mini}"
        >
            <lead-status :lead="props.item"/>
        </td>
    </tr>

</template>
<script>
    import Caller from './Caller'
    import LeadComments from './LeadComments'
    import LeadStatus from './LeadStatus'
    import LeadPostpones from './LeadPostpones'
    import InteractionsCard from '../customers/InteractionsCard'
    import LeadContextMenuEntry from './LeadContextMenuEntry'
    import PhoneViewer from '../main/PhoneViewer'
    import UserAvatar from '../main/UserAvatar'
    import SmsSender from './SmsSender'

    export default {
        name: 'Lead',
        props: ['props'],
        computed: {
            lastPostponeDate () {
                return this.$moment(this.$store.getters.withoutTZ(this.props.item.last_postpone.date))
                    .format('D MMMM YYYY г. HH:mm') || ''
            },
            eventControlTitle () {
                if (!this.workingIsland) {
                    return 'Для управления записями заявок, выберите островок'
                }
                return this.props.item.event ?
                    `Редактировать запись на ${this.$moment(this.$store.getters.withoutTZ(this.props.item.event.date))
                        .format('D MMMM YYYY г. HH:mm')}` : 'Добавить запись по заявке'
            },
            workingIsland () {
                return this.$store.getters.workingIsland
            },
            todayPostpones () {
                return this.$store.state.loader.showTodayPostpones
            },
            perPage () {
                return this.$store.state.paginator.per_page
            },
            page () {
                return this.$store.state.paginator.page
            },
            mini () {
                return this.$store.getters.miniMode
            },
            leadCommentsId: {
                get () {
                    return this.$store.state.lead.leadCommentsId
                },
                set (val) {
                    this.$store.commit('SET_LEAD_COMMENTS_ID', val)
                }
            },
            openLeadId: {
                get () {
                    return this.$store.state.lead.openLeadId
                },
                set (val) {
                    this.$store.commit('SET_OPEN_LEAD_ID', val)
                }
            },
            interactionsOpenId: {
                get () {
                    return this.$store.state.lead.interactionsOpenId
                },
                set (val) {
                    this.$store.commit('SET_INTERACTIONS_OPEN_ID', val)
                }
            },
            menuOpenId: {
                get () {
                    return this.$store.state.lead.menuOpenId
                },
                set (val) {
                    this.$store.commit('SET_LEAD_MENU_OPEN_ID', val)
                }
            },
            contextMenu: {
                get () {
                    return this.props.item.id === this.menuOpenId
                },
                set (val) {
                    if (!val) {
                        this.$store.commit('SET_LEAD_MENU_OPEN_ID', val)
                    }
                }
            },
            basePath () {
                return this.$store.state.basePath
            },
            realDate () {
                return this.$store.state.realDate
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            }
        },
        methods: {
            clearDate(datetime) {
              return datetime.includes('T') ? datetime.split('T')[0] : datetime.split(' ')[0]
            },
            leadUser (lead) {
                return this.$store.state.users.find(item => +item.id === +lead.user_id) || null
            },
            eventControlAction () {
                if (!this.workingIsland) {
                    return
                }
                this.props.item.event ? this.$store.commit('SET_EDITED_EVENT', this.props.item.event) : this.$store.commit('SET_ATTEMPT_TO_EVENT', this.props.item)
            },
            confirmToDelete () {
                this.$store.commit('SET_LEAD_TO_DELETE', this.props.item)
            },
            showInteractions () {
                this.interactionsOpenId = this.props.item.id
            },
            showLead () {
                this.openLeadId = this.props.item.id
            },
            openMenu () {
                this.menuOpenId = this.props.item.id
            }
        },
        components: {
            Caller,
            LeadComments,
            LeadStatus,
            LeadPostpones,
            InteractionsCard,
            LeadContextMenuEntry,
            PhoneViewer,
            UserAvatar,
            SmsSender
        }
    }
</script>
<style scoped>
    .mini {
        height: 1em!important;
        padding: 0!important;
    }
    .clear-td {
        padding: 0 !important;
        margin: 0 !important;
    }
    .clickable {
        cursor: pointer;
        opacity: .8;
    }
    .clickable:hover {
        opacity: 1;
    }
    .delete {
        cursor: pointer;
        opacity: .6;
    }
    .delete:hover {
        opacity: 1;
    }
    .today {
        color: #2a9055;
        font-weight: bold;
    }
    .lost {
        color: red;
        font-weight: bold;
    }
</style>
