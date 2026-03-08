const simpleGit = require("simple-git")

const git = simpleGit()

async function cloneRepo(){

    await git.clone(
        "https://github.com/username/repository.git",
        "./repo"
    )
}

module.exports = { cloneRepo }