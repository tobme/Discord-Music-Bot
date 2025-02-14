const {UserManager, User} = require('../../TimeHandling/UserManager.js')


test("getUser_noUser_ReturnsNull", () => {
    let userManager = new UserManager()

    const retValue = userManager.getUser('ID')

    expect(retValue).toBe(null);
});

test("getUser_hasUser_ReturnsUser", () => {
    let userManager = new UserManager()

    let tmpUser = new User('UserName', 0, false, new Date(), 'id', 0, "-1", 0, new Object(), new Object())

    userManager.addUser('ID', tmpUser)

    const retValue = userManager.getUser('ID')

    expect(retValue).toEqual(tmpUser);
});

test("userExists_noUser_ReturnsFalse", () => {
    let userManager = new UserManager()

    const retValue = userManager.userExists('ID')

    expect(retValue).toBe(false);
});

test("userExists_hasUser_ReturnsTrue", () => {
    let userManager = new UserManager()

    let tmpUser = new User('UserName', 0, false, new Date(), 'id', 0, "-1", 0, new Object(), new Object())

    userManager.addUser('ID', tmpUser)

    const retValue = userManager.userExists('ID')

    expect(retValue).toBe(true);
});

test("updateUser_hasUser_ReturnsUpdatedUser", () => {
    let userManager = new UserManager()

    let tmpUser = new User('UserName', 0, false, 'id', new Date('2025-02-11T10:00:00.000Z'), 0, "-1", 0, new Object(), new Object())
    let updatedUser = new User('UserName', 0, true, 'id', new Date('2025-02-11T10:00:00.000Z'), 0, "-1", 0, new Object(), new Object())

    userManager.addUser('ID', tmpUser)

    userManager.updateUser('ID', { inDiscord: true})

    const retValue = userManager.getUser('ID')

    expect(retValue).toEqual(updatedUser);
});