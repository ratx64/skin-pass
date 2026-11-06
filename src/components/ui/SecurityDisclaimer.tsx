export const SecurityDisclaimer = () => {
  return (
    <section className="facts" aria-labelledby="tool-facts">
      <h2 id="tool-facts">What this tool is and is not</h2>
      <dl>
        <div>
          <dt>What it is</dt>
          <dd>
            A local deterministic converter for CS2 inspect links. Same inputs always produce the same output.
          </dd>
        </div>
        <div>
          <dt>What it is not</dt>
          <dd>
            It is not a password manager and cannot protect against malware, keyloggers, or compromised browsers.
          </dd>
        </div>
        <div>
          <dt>Best practice</dt>
          <dd>Add a secret phrase for privacy and store final credentials in a trusted password manager.</dd>
        </div>
      </dl>
    </section>
  );
};
