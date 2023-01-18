<template>
    <v-flex>
        <certificate-mode-switcher/>
        <v-data-table
                :pagination.sync="defSorting"
                :headers="headers"
                :items="certificates"
                hide-actions
        >
            <template
                    v-slot:items="props"
            >
                <certificate
                        :index="props.index"
                        :certificate="props.item"
                />
            </template>
            <template v-slot:no-data>
                <span class="red--text">Нет оформленных сертификатов</span>
            </template>
        </v-data-table>
        <certificate-comments/>
    </v-flex>
</template>

<script>
    import CertificateModeSwitcher from './CertificateModeSwitcher'
    import Certificate from './Certificate'
    import CertificateComments from './CertificateComments'
    export default {
        name: 'CertificatesTable',
        data: () => ({
            defSorting: {'sortBy': 'start_date', 'ascending': false, 'rowsPerPage': -1},
            headers: [
                {text: '#', value: null, sortable: false},
                {text: 'Заказчик', value: 'customer_id'},
                {text: 'Оформил', value: 'user_id'},
                {text: 'Номинал', value: 'nominal'},
                {text: 'Начало периода', value: 'start_date'},
                {text: 'Срок действия (дн.)', value: 'duration', align: 'center'},
                {text: 'Окончание периода', value: 'finish_date'},
                {text: 'Списания', value: null, sortable: false},
                {text: 'Комментарии', value: null, sortable: false}
            ]
        }),
        computed: {
            certificates () {
                const base = this.$store.state.subscribes.certificates
                return base.map(item => ({...item, user: this.$store.getters.allUsers.find(user => +user.id === +item.user_id) || null}))
            }
        },
        created() {
            this.$store.dispatch('setCertificates')
        },
        components: {
            CertificateModeSwitcher,
            CertificateComments,
            Certificate
        }
    }
</script>

<style scoped>

</style>
