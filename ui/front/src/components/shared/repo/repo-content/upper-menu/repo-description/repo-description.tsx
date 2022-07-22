import styles from './repo-description.module.scss';

function RepoDescription() {
  return (
    <div className={styles.description}>
      <h2>Test repo 1</h2>
      <p>Bitcoin is an experimental digital currency that enables instant payments to anyone, anywhere in the world. Bitcoin uses peer-to-peer technology to operate with no central authority: managing transactions and issuing money are carried out collectively by the network. Bitcoin Core is the name of open source software which enables the use of this currency.
          <span>For more information read the original Bitcoin whitepaper.</span></p>
      <h4>What is Test Repo 1?</h4>
      <p>Testing and code review is the bottleneck for development; we get more pull requests than we can review and test on short notice. Please be patient and help out by testing other people's pull requests, and remember this is a security-critical project where any mistake might cost people lots of money.</p>
    </div>
  );
}

export default RepoDescription;
