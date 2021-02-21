const models = require('../models')
const Expense = models.Expense

const find = async (id, include = []) => {
    try {
        let expense = Expense.findByPk(id, {include: include})
        if (expense) {
            return expense
        }
    } catch (e) {
        Promise.reject(e)
    }
}

const create = async data => {
    try {
        const expense = await Expense.create({...data})
        await expense.reload({include: ['user', 'island']})
        const info = {text: `Добавлен расход "${expense.comment}" на ${expense.amount}р.`}
        return Promise.resolve({expense, info})
    } catch (e) {
        return Promise.reject(new Error(`Expense create failed: ${e}`))
    }
}

const remove = async data => {
    try {
        const expense = await Expense.findByPk(data.id)
        const expenseId = expense.id
        const info = {text: `Удален расход "${expense.comment}" на ${expense.amount}р.`}
        await expense.destroy()
        return Promise.resolve({expense: {id: expenseId}, info})
    } catch (e) {
        return Promise.reject(new Error(`Remove expense failed: ${e}`))
    }
}

module.exports = {
    find,
    create,
    remove
}

