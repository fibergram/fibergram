import { Updates } from '../../src'

const update = Updates.command({
  updateId: 1,
  chatId: 100,
  command: "/echo",
  args: "hello world"
})
