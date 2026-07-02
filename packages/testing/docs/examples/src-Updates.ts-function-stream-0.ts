import { Updates } from '../../src'

const updates = Updates.stream([
  Updates.text({ updateId: 1, chatId: 100, text: "a" }),
  Updates.text({ updateId: 2, chatId: 100, text: "b" })
])
