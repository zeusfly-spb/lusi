<template>
    <td nowrap align="center">
        <v-select
            v-model="selectedChiefId"
            :items="users"
            item-text="full_name"
            item-value="id"
            single-line
            v-if="active"
            autofocus
            @blur="deactivate"
        />
          <span class="clickable"
                v-if="!active"
                @click="activate"
                :title="`Назначить руководителя на островок ${island && island.name || ''}`"
          >
              <v-avatar
                  size="30px"
                  style="margin-bottom: .2em"
                  v-if="chiefName !== 'Нет'"
              >
                  <img :src="`${basePath}${chiefAvatar}`"
                       alt="Фото"
                       :title="chiefName"
                  />
              </v-avatar>
              {{ chiefName }}
          </span>
        <v-icon
           class="clickable"
           v-if="!active && island.chiefs && island.chiefs.length"
           :title="`Показать историю назначения руководителей на островок ${island.name}`"
           @click="showHistory"
        >
            list
        </v-icon>
        <v-dialog
            v-model="history"
            max-width="800px"
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">История назначений руководителя на островок {{ island.name }}</span>
                    <v-spacer/>
                    <v-icon
                        color="white"
                        class="clickable mr-3"
                        title="Закрыть"
                        @click="hideHistory"
                    >
                        close
                    </v-icon>
                </v-card-title>
                <v-card-text>
                    <v-data-table
                        v-if="island.chiefs"
                        :items="island.chiefs"
                        hide-headers
                        hide-actions
                    >
                        <template v-slot:items="props">
                            <tr>
                                <td>
                                    <chief-appointment-date-changer
                                        :island="island"
                                        :chiefIndex="props.index"
                                        @updated="showSuccess"
                                    />
                                </td>
                                <td>{{ userNameById(props.item.user_id)  }}</td>
                            </tr>
                        </template>

                    </v-data-table>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        flat="flat"
                        @click="hideHistory"
                    >
                        Закрыть
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </td>
</template>
<script>
    import ChiefAppointmentDateChanger from './ChiefAppointmentDateChanger'
    export default {
        name: 'ChiefUpdater',
        props: ['island'],
        data: () => ({
            active: false,
            history: false
        }),
        computed: {
            accountingDate () {
                return this.$store.state.accountingDate
            },
            selectedChiefId: {
                get () {
                    return this.island && this.chiefId || null
                },
                set (val) {
                    this.$store.dispatch('updateIslandChiefId', {
                        island_id: this.island.id,
                        chief_id: val
                    })
                        .then(() => {
                            this.deactivate()
                            let hint = this.chiefName === 'Нет' ? `С островка ${this.island.name} сняли руководителя`
                                : `Сотрудник ${this.chiefName} назначен руководителем островка ${this.island.name}`
                            this.$emit('updated', hint)
                        })
                }
            },
            chiefId () {
                if (!this.island.chiefs) {
                    return null
                }
                let chiefs = this.island.chiefs
                if (!chiefs.length) {
                    return null
                }
                chiefs.sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0)
                let target = chiefs.find(chief => chief.date === this.accountingDate || chief.date < this.accountingDate)
                return target && target.user_id || null
            },
            users () {
                let users = this.$store.state.users.filter(item => !item.fired_at && !item.is_superadmin)
                return [{id: null, full_name: 'Нет'}, ... users]
            },
            chiefName () {
                let target = this.island && this.users && this.users.find(user => +user.id === +this.chiefId) || null
                return target && target.full_name || 'Нет'
            },
            chiefAvatar () {
                let target = this.island && this.users && this.users.find(user => +user.id === +this.chiefId) || null
                return target && target.avatar || '/img/default.jpg'
            },
            basePath () {
                return this.$store.state.basePath
            }
        },
        methods: {
            showSuccess (data) {
                let text = `На островке ${this.island.name} изменена дата назначения сотрудника ${this.userNameById(data.user_id)} на ${this.$moment(data.date).format('DD MMMM YYYY г.')}`
                this.$emit('updated', text)
            },
            userNameById (id) {
                let target = this.$store.state.users.find(user => +user.id === +id)
                return target && target.full_name || 'Нет'
            },
            hideHistory () {
                this.history = false
            },
            showHistory () {
                this.history = true
            },
            activate () {
                this.active = true
            },
            deactivate () {
                this.active = false
            }
        },
        components: {
            ChiefAppointmentDateChanger
        }
    }
</script>
<style scoped>
    .clickable {
        cursor: pointer;
    }
    .clickable:hover {
        font-weight: bold;
    }
</style>
