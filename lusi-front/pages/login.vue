<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="6" md="3"
           align-self="center"
    >
      <div class="text-center">
        <v-card flat>
          <v-card-title primary-title>
            <h4>Вход</h4>
          </v-card-title>
          <v-form>
            <v-text-field
                class="mr-4"
                prepend-icon="mdi-account" name="name" label="Имя пользователя"
                v-model="credentials.name"
                @keyup.enter="logIn"
                data-vv-as="«Логин»"
            />
<!--            v-validate="'required'"-->

            <!--            <span class="red&#45;&#45;text">{{ errors.first('name') }}</span>-->
            <v-text-field
                class="mr-4"
                prepend-icon="mdi-lock"
                name="password"
                label="Пароль"
                type="password"
                v-model="credentials.password"
                @keyup.enter="logIn"
                data-vv-as="«Пароль»"
            />
<!--            v-validate="'required'"-->

            <!--            <span class="red&#45;&#45;text">{{ errors.first('password') }}</span>-->

            <v-card-actions>
              <v-spacer/>
              <v-btn
                  large
                  primary
                  @click="logIn"
              >
                ВХОД
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>

      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'Login',
  layout: 'guest',
  data: () => ({
    credentials: {
      name: '',
      password: ''
    }
  }),
  methods: {
    async logIn () {
      try {
        await this.$auth.loginWith('local', { data: this.credentials })
      } catch (err) {
        console.log(err)
      }
    }
  },
  computed: {
    loggedIn () {
      return this.$auth.loggedIn
    }
  },
  watch: {
    loggedIn (val) {
      val ? this.$router.push('/') : null
    }
  }
}
</script>

<style scoped>

</style>