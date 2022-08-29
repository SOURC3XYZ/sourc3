const core = require('@actions/core')
const github = require('@actions/github')
const AdmZip = require('adm-zip')
const filesize = require('filesize')
const pathname = require('path')
const fs = require('fs')

function checkArtifact(artifact_name, platform_name, network_name, downloadable_artifacts) {
    let is_target_artifact = false;
    for (const target_artifact of downloadable_artifacts) {
        if (artifact_name.indexOf(target_artifact) !== -1) {
            is_target_artifact = true;
            break;
        }
    }
    if (!is_target_artifact) {
        return false;
    }
    if (artifact_name.indexOf("wasm") !== -1) {
        return true;
    }

    return artifact_name.indexOf(platform_name) !== -1 && artifact_name.indexOf(network_name) !== -1;
}

function checkArtifactsInRun(artifacts, platform_name, network_name, downloadable_artifacts) {
    for (const target_artifact of downloadable_artifacts) {
        let is_target_artifact = false;
        for (const artifact of artifacts) {
            if (artifact.name.indexOf(target_artifact) !== -1 && (artifact.name.indexOf("wasm") !== -1 ||
                (artifact.name.indexOf(platform_name) !== -1 && artifact.name.indexOf(network_name) !== -1))) {
                is_target_artifact = true;
                break;
            }
        }
        if (!is_target_artifact) {
            return false;
        }
    }
    return true;
}


async function main() {
    try {
        const token = core.getInput("github_token", { required: true })
        const workflow = core.getInput("workflow", { required: true })
        const downloadable_artifacts = core.getInput("download_artifacts", { required: true }).split(";")
        const [owner, repo] = core.getInput("repo", { required: true }).split("/")
        const path = core.getInput("path", { required: true })
        const platform_name = core.getInput("platform_name")
        const network_name = core.getInput("net_name")
        let workflowConclusion = core.getInput("workflow_conclusion")
        let pr = core.getInput("pr")
        let commit = core.getInput("commit")
        let branch = core.getInput("branch")
        let event = core.getInput("event")
        let runID = core.getInput("run_id")
        let runNumber = core.getInput("run_number")
        let checkArtifacts = core.getInput("check_artifacts")
        let searchArtifacts = core.getInput("search_artifacts")

        const client = github.getOctokit(token)

        console.log("==> Workflow:", workflow)

        console.log("==> Repo:", owner + "/" + repo)

        console.log("==> Platform: ", platform_name)

        console.log("==> Network: ", network_name)

        console.log("==> Assets: ", downloadable_artifacts)

        if (pr) {
            console.log("==> PR:", pr)

            const pull = await client.rest.pulls.get({
                owner: owner,
                repo: repo,
                pull_number: pr,
            })
            commit = pull.data.head.sha
            branch = pull.data.head.ref
        }

        if (commit) {
            console.log("==> Commit:", commit)
        }

        if (branch) {
            branch = branch.replace(/^refs\/heads\//, "")
            console.log("==> Branch:", branch)
        }

        if (event) {
            console.log("==> Event:", event)
        }

        if (runNumber) {
            console.log("==> RunNumber:", runNumber)
        }

        if (!runID) {
            for await (const runs of client.paginate.iterator(client.rest.actions.listWorkflowRuns, {
                    owner: owner,
                    repo: repo,
                    workflow_id: workflow,
                    branch: branch,
                    event: event,
                }
            )) {
                for (const run of runs.data) {
                    if (commit && run.head_sha != commit) {
                        continue
                    }
                    if (runNumber && run.run_number != runNumber) {
                        continue
                    }
                    if (workflowConclusion && (workflowConclusion != run.conclusion && workflowConclusion != run.status)) {
                        continue
                    }
                    if (checkArtifacts || searchArtifacts) {
                        let artifacts = await client.rest.actions.listWorkflowRunArtifacts({
                            owner: owner,
                            repo: repo,
                            run_id: run.id,
                        })
                        if (artifacts.data.artifacts.length === 0) {
                            continue
                        }
                        if (searchArtifacts) {
                            const artifact = checkArtifactsInRun(artifacts.data.artifacts, platform_name,
                                network_name, downloadable_artifacts);
                            if (!artifact) {
                                continue
                            }
                        }
                    }
                    runID = run.id
                    break
                }
                if (runID) {
                    break
                }
            }
        }

        if (runID) {
            console.log("==> RunID:", runID)
        } else {
            throw new Error("no matching workflow run found")
        }

        let artifacts = await client.paginate(client.rest.actions.listWorkflowRunArtifacts, {
            owner: owner,
            repo: repo,
            run_id: runID,
        })

        // One artifact or all if `name` input is not specified.
        if (platform_name && network_name) {
            artifacts = artifacts.filter((artifact) => {
                return checkArtifact(artifact.name, platform_name, network_name, downloadable_artifacts);
            })
        }

        if (artifacts.length === 0)
            throw new Error("no artifacts found")

        for (const artifact of artifacts) {
            console.log("==> Artifact:", artifact.id)

            const size = filesize(artifact.size_in_bytes, {base: 10})

            console.log(`==> Downloading: ${artifact.name}.zip (${size})`)

            const zip = await client.rest.actions.downloadArtifact({
                owner: owner,
                repo: repo,
                artifact_id: artifact.id,
                archive_format: "zip",
            })

            const dir = path

            fs.mkdirSync(dir, {recursive: true})

            const adm = new AdmZip(Buffer.from(zip.data))

            adm.getEntries().forEach((entry) => {
                const action = entry.isDirectory ? "creating" : "inflating"
                const filepath = pathname.join(dir, entry.entryName)

                console.log(`  ${action}: ${filepath}`)
            })

            adm.extractAllTo(dir, true)
        }
    } catch (error) {
        core.setOutput("error_message", error.message)
        core.setFailed(error.message)
    }
}

main()

