<template>
    <v-flex>
        <appointment-dialog/>
        <v-data-table
            :headers="headers"
            :items="appointments"
            hide-actions
            class="elevation-1"
        >
            <template v-slot:items="props">
                <tr>
                    <td>{{ props.index + 1 }}</td>
                    <td v-if="!workingIslandId">{{ props.item.island && props.item.island.name || '' }}</td>
                    <td>{{ props.item.service && props.item.service.description || '' }}</td>
                    <td>{{ props.item.client_name || '' }}</td>
                    <td>{{ props.item.client_phone || '' }}</td>
                    <td>
                        <v-avatar
                            size="36px"
                            :title="props.item.performer.full_name"
                        >
                            <img :src="basePath + props.item.performer.avatar" alt="Фото" v-if="props.item.performer.avatar">
                            <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-else>
                        </v-avatar>
                    </td>
                    <td>{{ props.item.date | moment('DD MMMM YYYY г.') }}</td>
                    <td>{{ props.item.date | moment('HH:mm') }}</td>
                    <td>{{ props.item.comment }}</td>
                    <td>
                        <v-avatar
                            size="36px"
                            :title="props.item.user.full_name"
                        >
                            <img :src="basePath + props.item.user.avatar" alt="Фото" v-if="props.item.user.avatar">
                            <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-else>
                        </v-avatar>
                    </td>
                    <td>{{ props.item.created_at | moment('DD MMMM YYYY г. HH:mm')}}</td>
                    <td align="center">
                        <v-btn
                            small
                            icon
                            title="Изменить"
                        >
                            <v-icon
                                small
                                color="green"
                            >
                                edit
                            </v-icon>
                        </v-btn>
                        <v-btn
                            small
                            icon
                            title="Удалить"
                        >
                            <v-icon
                                small
                                color="red"
                            >
                                delete
                            </v-icon>
                        </v-btn>
                    </td>
                </tr>
            </template>
            <template v-slot:no-data>
                <span class="red--text">Нет записей</span>
            </template>
        </v-data-table>
    </v-flex>
</template>
<script>
    import AppointmentDialog from './AppointmentDialog'
    export default {
        name: 'AppointmentsTable',
        computed: {
            basePath () {
                return this.$store.state.basePath
            },
            headers () {
                let base = [
                    {text: '#', value: null},
                    {text: 'Островок', value: 'island.name'},
                    {text: 'Услуга', value: 'service.name'},
                    {text: 'Клиент', value: 'clent_name'},
                    {text: 'Телефон', value: 'client_phone'},
                    {text: 'Исполнитель', value: 'performer.full_name'},
                    {text: 'Дата', value: 'date'},
                    {text: 'Время', value: 'time'},
                    {text: 'Комментарий', value: 'comment'},
                    {text: 'Записал', value: 'user.full_name'},
                    {text: 'Записано', value: 'created_at'},
                    {text: 'Действия', value: null, sortable: false, align: 'center'}
                ]
                return this.workingIslandId ? base.filter(item => item.value !== 'island.name') : base
            },
            workingIslandId () {
                return this.$store.state.workingIslandId
            },
            appointments () {
                return this.$store.state.appointment.appointments
            }
        },
        components: {
            AppointmentDialog
        }
    }
</script>
