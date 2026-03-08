import axios from "axios"

export function setupCounter(element) {
  let count = 0
  const setCount = (count) => {
    element.innerHTML = `count is ${count}`
  }
  element.addEventListener('click', () => setCount(++count))
  setCount(0)
}

function solveIssue(issueNumber) {
  axios.post("http://localhost:5000/solve", {
    issueNumber
  })
}