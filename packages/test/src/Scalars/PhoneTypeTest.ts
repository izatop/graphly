import {Scalars} from "@graphly/schema";

describe("Scalars", () => {
    const phoneNumbers = [
        ["+79991231212", "+79991231212"],
        ["79991231212", false],
    ] as const;

    test.each(phoneNumbers)("%s equals %s", (a, expected) => {
        if (expected) {
            expect(Scalars.PhoneNumberType.parseValue(a)).toBe(expected);
            expect(Scalars.PhoneNumberType.serialize(a)).toBe(expected);
            return;
        }

        const e = /^Value is not a valid phone number/;
        expect(() => Scalars.PhoneNumberType.parseValue(a)).toThrow(e);
        expect(() => Scalars.PhoneNumberType.serialize(a)).toThrow(e);
    });
});
