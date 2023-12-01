import { mod } from '../../bindings/crypto/finite_field.js';
import { Field } from '../../lib/core.js';
import { ZkProgram } from '../proof_system.js';
import {
  Spec,
  boolean,
  equivalentAsync,
  fieldWithRng,
} from '../testing/equivalent.js';
import { Random } from '../testing/property.js';
import { assert } from './common.js';
import { Gadgets } from './gadgets.js';
import { constraintSystem, contains } from '../testing/constraint-system.js';

let maybeUint = (n: number | bigint): Spec<bigint, Field> => {
  let uint = Random.bignat((1n << BigInt(n)) - 1n);
  return fieldWithRng(
    Random.map(Random.oneOf(uint, uint.invalid), (x) => mod(x, Field.ORDER))
  );
};

let Lookup = ZkProgram({
  name: 'lookup',
  methods: {
    three12Bit: {
      privateInputs: [Field, Field, Field],
      method(v0: Field, v1: Field, v2: Field) {
        // Dummy range check to make sure the lookup table is initialized
        // It should never fail because 64 > 12
        Gadgets.rangeCheck64(v0);
        Gadgets.three12Bit(v0, v1, v2);
      },
    },
  },
});

// constraint system sanity check

constraintSystem.fromZkProgram(Lookup, 'three12Bit', contains(['Lookup']));

await Lookup.compile();

await equivalentAsync(
  { from: [maybeUint(13), maybeUint(13), maybeUint(13)], to: boolean },
  { runs: 3 }
)(
  (x, y, z) => {
    assert(x < 1n << 12n);
    assert(y < 1n << 12n);
    assert(z < 1n << 12n);
    return true;
  },
  async (x, y, z) => {
    let proof = await Lookup.three12Bit(x, y, z);
    return await Lookup.verify(proof);
  }
);
