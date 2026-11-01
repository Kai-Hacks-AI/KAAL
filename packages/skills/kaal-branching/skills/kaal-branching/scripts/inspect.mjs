#!/usr/bin/env node
// Read-only supplied-snapshot inspection. No Git, GitHub or mutation interface.
import { resolveRuntime } from "./modules/runtime.mjs";
const flags=["--runtime","--mode","--phase","--config","--proposal"];
function argumentsOf(argv) {
  const args=new Map();
  for(let i=0;i<argv.length;i+=2) {
    const flag=argv[i],value=argv[i+1];
    if(!flags.includes(flag)||args.has(flag)||value===undefined||value.startsWith("--"))
      throw new Error("Supply each supported flag exactly once: "+flags.join(" ")+".");
    args.set(flag,value);
  }
  if(flags.some(flag=>!args.has(flag))) throw new Error("Explicit runtime, mode, phase, configuration and proposal paths are required.");
  if(!["embed","external"].includes(args.get("--mode"))) throw new Error("Mode must be embed or external.");
  if(!["inspect","prepare","execute","verify"].includes(args.get("--phase"))) throw new Error("Unknown operation phase.");
  return args;
}
async function main(argv) {
  const args=argumentsOf(argv),phase=args.get("--phase"),mode=args.get("--mode");
  if(phase!=="inspect") return {exit:5,output:{kind:"unsupported",operation:"inspect",phase,mode,message:"This candidate supports snapshot inspection only. No operation was prepared, executed or verified."}};
  const runtime=await resolveRuntime(args.get("--runtime"));
  const configuration=await runtime.readFile(args.get("--config"));
  const proposal=await runtime.readFile(args.get("--proposal"));
  const decoder=new TextDecoder("utf-8",{fatal:true});
  const classification=runtime.classify(decoder.decode(configuration),decoder.decode(proposal));
  return {
    exit:classification.kind==="pass"?0:classification.kind==="fail"?1:2,
    output:{
      kind:classification.kind,operation:"inspect",phase,mode,classification,
      inputs:{configuration:runtime.sha256(configuration),proposal:runtime.sha256(proposal)},
      runtime:runtime.identity,
      assurance:{package:"not-assessed",configuration:"syntax-and-vocabulary-only",policyAuthority:"not-verified",boundary:"not-verified"},
      execution:"unsupported"
    }
  };
}
try {
  const {exit,output}=await main(process.argv.slice(2));
  process.stdout.write(JSON.stringify(output,null,2)+"\n");process.exitCode=exit;
} catch(error) {
  process.stdout.write(JSON.stringify({kind:"cannot-judge",operation:"inspect",message:error.message})+"\n");
  process.exitCode=2;
}


