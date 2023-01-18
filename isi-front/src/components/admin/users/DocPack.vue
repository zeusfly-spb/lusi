<template>
    <v-flex>
        <v-icon
            class="clickable"
            @click="active = true"
            :color="filled ? null : 'red'"
            :title="filled ? `Пакет документов сотрудника ${user.full_name}` : 'Недостаточно копий обязательных документов'"
        >
            {{ filled ? 'folder' : 'folder_open'}}
        </v-icon>
        <input type="file"
               name="image"
               ref="imageInput"
               accept="image/*"
               @change="loadImage"
               style="display: none"
        />
        <v-dialog
            persistent
            v-model="active"
            max-width="700px"
        >
            <v-card style="border-radius: 5px">
                <v-card-title
                    class="light-blue darken-3"
                >
                    <v-icon color="white" class="mr-2">
                        folder
                    </v-icon>
                    <span class="title white--text">{{ `Документы сотрудника ${user.full_name}` }}</span>
                </v-card-title>
                <v-card-text>
                    <custom-doc-adder :user="user" @added="showSuccess"/>
                    <v-data-table
                        :headers="headers"
                        :items="docs"
                        hide-actions
                        hide-headers
                    >
                        <template v-slot:items="props">
                            <td>
                                <v-icon
                                    v-if="props.item.custom"
                                    :title="props.item.pages.filter(item => item.location).length ? 'Чтобы удалить наименование, предварительно удалите все загруженные изображения' : `Удалить наименование документа '${props.item.title}'`"
                                    :disabled="props.item.pages.filter(item => item.location).length > 0"
                                    color="red darken-4"
                                    class="clickable"
                                    @click="showCustomDocDeleteConfirm(props.item)"
                                >
                                    close
                                </v-icon>
                                {{ props.item.title }}
                                <v-icon
                                    small
                                    :title="`Добавить страницу документа ${props.item.title}`"
                                    class="clickable"
                                    @click="addPage(props.item)"
                                >
                                    add_box
                                </v-icon>
                                <div v-if="props.item.pages && props.item.pages.length">
                                    <div v-for="page in props.item.pages" :key="page.id" class="pl-5">
                                        <v-icon
                                            small
                                            :title="`Удалить наименование документа '${page.title}'`"
                                            color="red darken-4"
                                            class="clickable"
                                            @click="showCustomDocDeleteConfirm(page)"
                                        >
                                            close
                                        </v-icon>
                                        <span class="mr-2">{{ page.name }}</span>
                                        <v-icon
                                            small
                                            class="clickable"
                                            :title="`Посмотреть изображение документа '${page.title}'`"
                                            v-if="page.location"
                                            color="teal darken-3"
                                            @click="showImage(page)"
                                        >
                                            remove_red_eye
                                        </v-icon>
                                        <v-icon
                                            small
                                            :class="{'mr-1 ml-1': page.location}"
                                            class="clickable"
                                            :title="`Загрузить изображение документа '${page.title}'`"
                                            color="light-blue darken-3"
                                            @click="showImageInput(page)"
                                        >
                                            cloud_upload
                                        </v-icon>
                                        <v-icon
                                            small
                                            v-if="page.location"
                                            class="clickable"
                                            :title="`Удалить изображение документа '${page.title}'`"
                                            color="red darken-4"
                                            @click="showDeleteConfirm(page)"
                                        >
                                            delete_forever
                                        </v-icon>
                                    </div>
                                </div>
                            </td>
                            <td align="right">
                                <v-icon
                                    class="mr-3 clickable"
                                    :title="`Посмотреть изображение документа '${props.item.title}'`"
                                    v-if="images[props.item.field] && !props.item.custom || props.item.custom && props.item.location"
                                    color="teal darken-3"
                                    @click="showImage(props.item)"
                                >
                                    remove_red_eye
                                </v-icon>
                                <v-icon
                                    :class="{'mr-3': images[props.item.field] || props.item.custom && props.item.location}"
                                    class="clickable"
                                    :title="`Загрузить изображение документа '${props.item.title}'`"
                                    color="light-blue darken-3"
                                    @click="showImageInput(props.item)"
                                >
                                    cloud_upload
                                </v-icon>
                                <v-icon
                                    v-if="images[props.item.field] && !props.item.custom || props.item.custom && props.item.location"
                                    class="clickable"
                                    :title="`Удалить изображение документа '${props.item.title}'`"
                                    color="red darken-4"
                                    @click="showDeleteConfirm(props.item)"
                                >
                                    delete_forever
                                </v-icon>
                            </td>
                        </template>
                        <template v-slot:no-data>
                            <span class="red--text">Нет изображений</span>
                        </template>
                    </v-data-table>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="active = false">Закрыть</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="preview"
            max-width="700"
        >
            <v-card>
                <v-card-title
                    class="light-blue darken-3"
                >
                    <span class="title white--text">Предпросмотр {{ uploadingImage && uploadingImage.title ? uploadingImage.title : '' }}</span>
                </v-card-title>
                <v-card-text
                    class="text-xs-center"
                >
                    <img src="" alt=""
                         width="500px"
                         ref="previewImage"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="preview = false">Отмена</v-btn>
                    <v-btn color="green darken-1" flat @click="uploadDocumentImage">Сохранить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="view"
        >
            <v-card>
                <v-card-title class="title light-blue darken-3">
                    <span class="white--text">Просмотр {{ viewingImage && viewingImage.title  ? viewingImage.title : '' }}</span>
                </v-card-title>
                <v-card-text>
                    <img
                        :src="`${basePath}${images[viewingImage && viewingImage.field ? viewingImage.field : null]}`"
                        v-if="viewingImage && !viewingImage.custom && images[viewingImage.field]"
                    />
                    <img
                        :src="`${basePath}${viewingImage.location}`"
                        v-if="viewingImage && viewingImage.custom && viewingImage.location"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="view = false">Закрыть</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="confirm"
                  max-width="500"
        >
            <v-card class="round-corner">
                <v-card-title class="subheading light-blue darken-3">
                    <span class="white--text title">Подтверждение</span>
                </v-card-title>
                <v-card-text>
                    <span class="title">{{ confirmText }}</span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        flat="flat"
                        @click="confirm = false"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        v-if="imageToDelete"
                        color="red darken-1"
                        flat="flat"
                        @click="deleteImage"
                    >
                        Удалить
                    </v-btn>
                    <v-btn
                        v-if="customDocToDelete"
                        color="red darken-1"
                        flat="flat"
                        @click="deleteCustomDoc"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>

    </v-flex>
</template>
<script>
    import CustomDocAdder from './CustomDocAdder'
    export default {
        name: 'DocPack',
        props: ['user'],
        data: () => ({
            customDocToDelete: null,
            imageToDelete: null,
            confirmText: '',
            confirm: false,
            viewingImage: null,
            view: false,
            uploadingImage: null,
            image: null,
            preview: false,
            imageFileReader: {},
            active: false,
            headers: [
                {
                    text: 'Наименование',
                    sortable: false,
                    value: null,
                    align: 'center'
                },
                {
                    text: 'Действия',
                    sortable: false,
                    value: null,
                    align: 'center'
                }
            ],
            requiredTitles: ['Паспорт', 'ИНН', 'СНИЛС']
        }),
        computed: {
            filled () {
                const present = (name) => {
                    let target = this.docs.find(item => item.title === name)
                    return !!(target && !!target.location)
                }
                let result = this.requiredTitles.map(item => present(item))
                return !result.filter(item => item === false).length
            },
            docs() {
                let base = [...this.customDocs]
                base = base.map(doc => ({...doc, pages: base.filter(item => +item.parent_id === +doc.id)}))
                return base.filter(doc => !doc.parent_id)
            },
            customDocs () {
                return this.user.document_pack.custom_docs.map(item => ({...item, title: item.name, custom: true}))
            },
            basePath () {
                return this.$store.state.basePath
            },
            images () {
                return this.user.document_pack
            }
        },
        methods: {
            addPage (doc) {
                this.$store.dispatch('addCustomDoc', {
                    id: this.user.document_pack.id,
                    name: `${doc.title} страница ${doc.pages.length + 2}`,
                    parent_id: doc.id
                })
                    .then(() => {
                        this.$emit('updated', `Добавлена страница для документа ${doc.title}`)
                    })
            },
            showCustomDocDeleteConfirm (custom) {
                if (custom.location) {
                    this.$emit('alert', `Чтобы удалить наменование, сначала удалите загруженное изображение!`)
                    return
                }
                this.customDocToDelete = custom
                this.confirmText = `Удалить наименование документа '${custom.name}' сотрудника ${this.user.full_name}?`
                this.confirm = true
            },
            deleteCustomDoc () {
                this.$store.dispatch('deleteCustomDoc', this.customDocToDelete.id)
                    .then(() => {
                        this.confirm = false
                        this.$emit('updated', `Удалено наименование документа ${this.customDocToDelete.title} у пользователя ${this.user.full_name}`)
                    })
            },
            showSuccess (text) {
                this.$emit('updated', text)
            },
            deleteImage () {
                if (this.imageToDelete.custom) {
                    this.$store.dispatch('deleteCustomImage', this.imageToDelete.id)
                        .then(() => {
                            this.confirm = false
                            this.$emit('updated', `Изображение документа '${this.imageToDelete.title}' удалено`)
                        })
                } else {
                    this.$store.dispatch('deleteDocumentImage', {
                        id: this.images.id,
                        field_name: this.imageToDelete.field
                    })
                        .then(() => {
                            this.confirm = false
                            this.$emit('updated', `Изображение документа '${this.imageToDelete.title}' удалено`)
                        })
                }
            },
            showDeleteConfirm (image) {
                this.imageToDelete = image
                this.confirmText = `Удалить изображение документа '${image.title}'?`
                this.confirm = true
            },
            showImage (image) {
                this.viewingImage = image
                this.view = true
            },
            reset () {
                this.preview = false
            },
            uploadDocumentImage () {
                if (this.uploadingImage.custom) {
                    let data = new FormData
                    data.append('id', this.uploadingImage.id)
                    data.append('image', this.image)
                    this.$store.dispatch('uploadCustomImage', data)
                        .then(() => this.reset())
                } else {
                    let data = new FormData
                    data.append('id', this.images.id)
                    data.append('field_name', this.uploadingImage.field)
                    data.append('image', this.image)
                    this.$store.dispatch('uploadDocumentImage', data)
                        .then(() => this.reset())
                }
            },
            showImageInput (image) {
                this.uploadingImage = image
                this.$refs.imageInput.click()
            },
            loadImage () {
                this.image = this.$refs.imageInput.files[0]
                this.imageFileReader.readAsDataURL(this.$refs.imageInput.files[0])
            }
        },
        created () {
            this.imageFileReader = new FileReader()
            this.imageFileReader.onload = (e)=> {
                this.$refs.previewImage.src = e.target.result
            }
        },
        watch: {
            image (value) {
                if (value) {
                    this.preview = true
                }
            },
            confirm (val) {
                if (!val) {
                    this.imageToDelete = this.customDocToDelete = null
                }
            }
        },
        components: {
            CustomDocAdder
        }
    }
</script>
<style scoped>
    .clickable {
        cursor: pointer;
        opacity: .6;
    }
    .clickable:hover {
        opacity: 1;
    }
</style>
