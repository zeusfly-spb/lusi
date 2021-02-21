<template>
    <v-select
        v-model="selectedColor"
        :items="indicatorColors"
        single-line
        item-text="title"
        item-value="value"
        :title="`Изменить цвет подсветки услуги ${service.description || ''}`"
    >
        <template v-slot:selection="{ item }">
            <div
                class="picker-color"
                :class="selectedColor || ''"
            >
                <div
                    class="blue-grey--text body-2"
                    style="height: 30px!important"
                >
                    <strong>{{ selectedColor || 'Не выбрано'}}</strong>
                </div>
            </div>
        </template>
        <template v-slot:item="{ item }">
            <div
                class="picker-color"
                :class="item.value"
            >
                <div
                    class="blue-grey--text body-2"
                >
                    <strong>{{ item.title }}</strong>
                </div>
            </div>
        </template>
    </v-select>
</template>

<script>
    export default {
        name: 'ServicesColorPicker',
        props: {
            service: Object
        },
        computed: {
            selectedColor: {
                get () {
                    return this.service.highlight
                },
                set (val) {
                    this.$store.dispatch('setServiceHighlight', {
                        service_id: this.service.id,
                        color: val
                    })
                }
            },
            indicatorColors () {
                const levels = 5
                const baseList = [
                    'light-blue',
                    'light-green',
                    'blue-grey',
                    'indigo',
                    'teal',
                    'lime',
                    'cyan',
                    'amber',
                    'red',
                    'pink',
                    'purple',
                    'deep-purple',
                    'blue',
                    'green',
                    'yellow',
                    'orange',
                    'deep-orange',
                    'brown',
                    'grey'
                ]
                let result = []
                baseList.forEach(baseColor => {
                    for (let index = levels; index >= 1; index--) {
                        result.push({
                            value: `${baseColor} lighten-${index}`,
                            title: `${baseColor} lighten-${index}`
                        })
                    }
                })
                return [
                    {value: null, title: 'Не выбрано'},
                    ...result
                ]
            }
        }
    }
</script>

<style scoped>
    .selection {
        line-height: 1px!important;
        padding: 0!important;
        margin: 0!important;
    }
    .picker-color {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
</style>
