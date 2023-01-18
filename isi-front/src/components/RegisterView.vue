<template>
    <div>
        <div>Регистрация</div>
        <p><label>Имя<br><input type="text" v-model="name" class="ip1"></label></p>
        <p><label>E-mail<br><input type="email" v-model="email" class="ip1"></label></p>
        <p><label>Пароль<br><input type="password" v-model="password" class="ip2"></label>
            <br>
            <label>Подтверждение пароля<br><input type="password" v-model="c_password" class="ip2"></label></p>
        <p><input type="submit" value="Отправить" @click.prevent="register" :disabled="password !== c_password"></p>
    </div>
</template>
<script>
    export default {
        data: () => ({
            name: '',
            email: '',
            password: '',
            c_password: ''
        }),
        methods: {
            register () {
                this.axios.post('/api/register', {
                    name: this.name,
                    email: this.email,
                    password: this.password,
                    c_password: this.c_password
                })
                    .then(res => this.$router.push('/login'))
                    .catch(e => console.dir(e))
            }
        }
    }
</script>
