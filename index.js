/**
 * +==============================================================================+
 *                                    CREDITS                                     
 * +==============================================================================+
 *  작성언어: JS                                                       
 * +------------------------------------------------------------------------------+
 *  명령어목록:                                                                   
 *  /ping : Pong1의 응답을 사용자에게만 표시합니다.                                
 *  /pinging : 모든 사용자에게 'sex'라는 응답을 표시합니다.                        
 *  /send : 전화번호와 내용을 입력합니다.                   (모달을 띄운다)                       
 *  /input : 값을 입력하고 버튼을 눌러 개인적으로 확인합니다.                      
 * +------------------------------------------------------------------------------+
 *  사용법:                                                                       
 *  1. npm install                                                               
 *  2. node index.js                                                                     
 * +==============================================================================+
 */


const fs = require('fs');
let TOKEN;

try {
    TOKEN = fs.readFileSync('token.txt', 'utf-8').trim();
} catch (error) {
    console.error("token.txt 파일을 찾을 수 없습니다. 올바른 위치에 token.txt를 배치하고 토큰 값을 입력하세요.");
    console.log("\n\nPress Enter to exit.");
    process.stdin.once("data", () => {
        process.exit();
    });
    return;
}

const { 
    Client, 
    GatewayIntentBits, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    Events, 
    ActionRowBuilder 
} = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });

client.once('ready', async () => {
    console.log('Logged in as ' + client.user.tag);

    for (const guild of client.guilds.cache.values()) {
        await guild.commands.create({
            name: 'ping',
            description: 'Replies with pong1 that only the user can see.',
        });

        await guild.commands.create({
            name: 'pinging',
            description: 'Replies with sex that everyone can see.',
        });

        await guild.commands.create({
            name: 'send',
            description: '전화번호와 내용을 입력합니다.',
        });

        await guild.commands.create({
            name: 'input',
            description: 'Enter a value and view it privately by pressing the button.',
            options: [{
                name: 'value',
                type: 3,
                description: 'The input value',
                required: true,
            }],
        });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply({ content: 'pong1', ephemeral: true });
    } else if (commandName === 'pinging') {
        await interaction.reply('sex');
    } else if (commandName === 'input') {
        const inputValue = interaction.options.getString('value');

        const button = {
            type: 2,
            style: 1,
            label: '인풋',
            customId: `show_input:${inputValue}`
        };

        const row = { type: 1, components: [button] };

        await interaction.reply({
            content: '인풋을 보려면 아래 버튼을 누르세요.',
            components: [row],
            ephemeral: true
        });
    } else if (commandName === 'send') {
        const modal = new ModalBuilder()
            .setCustomId('inputModal')
            .setTitle('정보 입력');

        const phoneNumberInput = new TextInputBuilder()
            .setCustomId('phoneNumberInput')
            .setLabel('전화번호 (11자리의 숫자만)')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(11)
            .setMinLength(11)
            .setPlaceholder('전화번호 입력')
            .setRequired(true);

        const contentInput = new TextInputBuilder()
            .setCustomId('contentInput')
            .setLabel('내용 (최대 10자의 글자 및 숫자)')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(10)
            .setPlaceholder('내용 입력')
            .setRequired(true);

        const phoneNumberActionRow = new ActionRowBuilder().addComponents(phoneNumberInput);
        const contentActionRow = new ActionRowBuilder().addComponents(contentInput);

        modal.addComponents(phoneNumberActionRow, contentActionRow);

        await interaction.showModal(modal);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'inputModal') {
        const phoneNumber = interaction.fields.getTextInputValue('phoneNumberInput');
        const content = interaction.fields.getTextInputValue('contentInput');

        if (!/^\d{11}$/.test(phoneNumber)) {
            await interaction.reply({
                content: '숫자만 입력하세요.',
                ephemeral: true
            });
            return;
        }

        await interaction.reply({
            content: `당신은 ${phoneNumber}에 ${content}을 입력했습니다.`,
            ephemeral: true
        });
    }

    if (!interaction.isButton()) return;

    const customId = interaction.customId;

    if (customId.startsWith('show_input:')) {
        const inputValue = customId.split(':')[1];

        await interaction.reply({
            content: `당신은 ${inputValue}을 입력했습니다.`,
            ephemeral: true
        });
    }
});


client.login(TOKEN).catch(error => {
    console.error("올바른 토큰을 입력하세요.");
    console.log("\n\nPress Enter to exit.");
    process.stdin.once("data", () => {
        process.exit();
    });
});