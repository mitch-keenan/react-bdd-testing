const temporarilySet = (object, propertyName, temporaryValue) => {
	const originalValue = object[propertyName];
	beforeAll(() => {
		object[propertyName] = temporaryValue;
	});

	afterAll(() => {
		object[propertyName] = originalValue;
	});
};

const testUtils = {
	temporarilySet,
};

export default testUtils;
