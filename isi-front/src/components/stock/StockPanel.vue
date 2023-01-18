<template>
    <v-flex align-center>
        <island-switcher/>
    <v-layout wrap>
        <insoles-table/>
        <half-insoles-table/>
        <goods-table/>
    </v-layout>
    <v-layout>
        <new-stock-action-dialog/>
        <v-spacer/>
    </v-layout>
    <stock-actions-table/>
    </v-flex>
</template>
<script>
    import NewStockActionDialog from './NewStockActionDialog'
    import StockActionsTable from './StockActionsTable'
    import IslandSwitcher from '../IslandSwitcher'
    import InsolesTable from "./InsolesTable";
    import HalfInsolesTable from "./HalfInsolesTable";
    import GoodsTable from "./GoodsTable";
    export default {
        name: 'StockPanel',
        components: {
            NewStockActionDialog,
            StockActionsTable,
            IslandSwitcher,
            InsolesTable,
            HalfInsolesTable,
            GoodsTable
        }
    }
</script>
<style scoped>
    table {
        border: solid 1px rgb(200,200,200);
        display: table;
        border-collapse: collapse;
        border-spacing: 2px;
    }
    td {
        border: solid 1px rgb(200,200,200);
        padding-left: .25em!important;
        padding-right: .25em!important;
    }
    .mat {
        color: rgba(0,0,0,0.54);
        font-weight: 500;
        font-size: 12px;
    }
    .clickable {
        opacity: .8;
        cursor: pointer;
    }
    .clickable:hover {
        opacity: 1;
    }
</style>
